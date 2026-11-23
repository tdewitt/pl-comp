'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '../..');
const profile = path.join(root, '.playwright-profile');

function playwright() {
  const install = execFileSync('mise', ['where', 'npm:playwright'], { encoding: 'utf8' }).trim();
  return require(path.join(install, 'node_modules', 'playwright'));
}

function appleString(value) {
  return `"${value.replaceAll('\\', '\\\\').replaceAll('"', '\\"')}"`;
}

function braveScript(lines) {
  return execFileSync('osascript', lines.flatMap(line => ['-e', line]), {
    encoding: 'utf8', timeout: 30000, maxBuffer: 8 * 1024 * 1024,
  }).trim();
}

function encodedResult(expression) {
  return `(() => { const result = (${expression}); return btoa(unescape(encodeURIComponent(JSON.stringify(result)))); })()`;
}

async function createBrowser(mode, url) {
  if (!/^https:\/\/app\.secureframe\.com\//.test(url)) throw new Error('Secureframe URL required');
  if (mode === 'playwright') {
    const context = await playwright().chromium.launchPersistentContext(profile, { headless: false });
    const page = context.pages()[0] || await context.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    return {
      async evaluate(expression) { return page.evaluate(expression); },
      async url() { return page.url(); },
      async close() { await context.close(); },
    };
  }
  if (mode !== 'brave') throw new Error(`Unknown browser: ${mode}`);
  const findTab = [
    'tell application "Brave Browser"',
    'repeat with w in windows',
    'repeat with t in tabs of w',
    `if (URL of t) is ${appleString(url)} then return (id of w as text) & ":" & (id of t as text)`,
    'end repeat', 'end repeat', 'return "MISSING"', 'end tell',
  ];
  let target = braveScript(findTab);
  if (target === 'MISSING') {
    braveScript(['tell application "Brave Browser"',
      `make new tab at end of tabs of front window with properties {URL:${appleString(url)}}`,
      'end tell']);
    target = braveScript(findTab);
  }
  if (!/^\d+:\d+$/.test(target)) throw new Error('Could not identify the Brave tab');
  const [windowId, tabId] = target.split(':');
  return {
    async evaluate(expression) {
      const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'sf-suite-'));
      const script = path.join(temp, 'action.js');
      try {
        fs.writeFileSync(script, encodedResult(expression), { mode: 0o600 });
        const output = braveScript([
          `set jsCode to read POSIX file ${appleString(script)}`,
          'tell application "Brave Browser"',
          `return (execute tab id ${tabId} of window id ${windowId} javascript jsCode)`,
          'end tell',
        ]);
        if (!output) throw new Error('Brave returned no JavaScript result; check Apple Events setting');
        return JSON.parse(Buffer.from(output, 'base64').toString('utf8'));
      } finally {
        fs.rmSync(temp, { recursive: true, force: true });
      }
    },
    async url() {
      return braveScript(['tell application "Brave Browser"',
        `return (URL of tab id ${tabId} of window id ${windowId})`, 'end tell']);
    },
    async close() {},
  };
}

module.exports = { createBrowser, playwright, profile };
