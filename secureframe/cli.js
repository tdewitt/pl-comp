#!/usr/bin/env node
'use strict';

const { playwright, profile } = require('./core/browser');
const vendors = require('./vendors/cli');

const usage = `Secureframe suite

  mise exec -- node secureframe/cli.js login
  mise exec -- node secureframe/cli.js vendors help

Browser setup is shared. Each Secureframe area has its own workflow subdirectory.`;

async function login() {
  const context = await playwright().chromium.launchPersistentContext(profile, { headless: false });
  try {
    const page = context.pages()[0] || await context.newPage();
    await page.goto('https://app.secureframe.com/vendors', { waitUntil: 'domcontentloaded', timeout: 60000 });
    console.log('Complete sign-in in the opened browser if needed. Waiting up to 10 minutes...');
    await page.waitForFunction(() => location.hostname === 'app.secureframe.com' &&
      !/\/login|\/sign-in|\/sso/i.test(location.pathname) &&
      document.body.innerText.includes('Vendors'), null, { timeout: 600000 });
    console.log('Secureframe session ready in .playwright-profile.');
  } finally { await context.close(); }
}

async function main() {
  const [area, ...args] = process.argv.slice(2);
  if (!area || area === 'help' || area === '--help') { console.log(usage); return; }
  if (area === 'login') return login();
  if (area === 'vendors') return vendors.run(args);
  throw new Error(`Unknown area: ${area}\n${usage}`);
}

main().catch(error => { console.error(error.stack || error.message); process.exitCode = 1; });
