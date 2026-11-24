#!/usr/bin/env node
// Replaces one text field on a completed Secureframe risk, then completes the assessment again.
// Requires the browser from browser-server.js (logged in, CDP on :9333).
// Usage: node edit-text.js <secureframe_risk_id> <step: assessment|treatment> <textbox label> <new text>
const { chromium } = require('playwright');
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function press(loc) {
  await loc.scrollIntoViewIfNeeded().catch(() => {});
  await loc.click({ timeout: 5000 }).catch(() => loc.dispatchEvent('click'));
}

(async () => {
  const [id, step, label, text] = process.argv.slice(2);
  const browser = await chromium.connectOverCDP('http://localhost:9333');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('secureframe'));
  page.setDefaultTimeout(10000);

  // Edit on a completed risk returns it to Draft; Complete assessment below restores it.
  await page.goto('https://app.secureframe.com/risk-management/details/' + id);
  await page.getByRole('button', { name: /View comments/ }).waitFor();
  await page.getByRole('button', { name: /View comments/ }).locator('xpath=following::button[1]').click();
  await press(page.getByRole('menuitem', { name: 'Edit', exact: true }));
  await page.waitForURL(/risk-management\/assessment\//, { timeout: 15000 });

  await press(page.getByRole('button', { name: step, exact: true }));
  await sleep(1500);
  const box = page.getByRole('textbox', { name: label, exact: true });
  const before = await box.inputValue();
  await box.fill(text);
  await box.blur();
  await sleep(2500);
  await page.getByText('All changes saved').first().waitFor({ timeout: 15000 });

  await press(page.getByRole('button', { name: 'review', exact: true }));
  await sleep(2000);
  await press(page.getByRole('button', { name: 'Complete assessment', exact: true }));
  await page.waitForURL(/risk-management\/details\//, { timeout: 15000 });
  console.log(JSON.stringify({ id, label, before, after: text }));
  process.exit(0);
})().catch(e => { console.error('ERR', e.message.split('\n')[0]); process.exit(1); });
