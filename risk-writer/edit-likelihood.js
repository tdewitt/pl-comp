#!/usr/bin/env node
// Changes the inherent likelihood on a completed Secureframe risk, then completes the assessment again.
// Requires the browser from browser-server.js (logged in, CDP on :9333).
// Usage: node edit-likelihood.js <secureframe_risk_id> "<n - Label>"   e.g. "3 - Moderate"
const { chromium } = require('playwright');
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function press(loc) {
  await loc.scrollIntoViewIfNeeded().catch(() => {});
  await loc.click({ timeout: 5000 }).catch(() => loc.dispatchEvent('click'));
}
(async () => {
  const [id, option] = process.argv.slice(2);
  const browser = await chromium.connectOverCDP('http://localhost:9333');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('secureframe'));
  page.setDefaultTimeout(10000);
  await page.goto('https://app.secureframe.com/risk-management/details/' + id);
  await page.getByRole('button', { name: /View comments/ }).waitFor();
  await page.getByRole('button', { name: /View comments/ }).locator('xpath=following::button[1]').click();
  await press(page.getByRole('menuitem', { name: 'Edit', exact: true }));
  await page.waitForURL(/risk-management\/assessment\//, { timeout: 15000 });
  await press(page.getByRole('button', { name: 'assessment', exact: true }));
  await sleep(1500);
  const likelihood = page.locator('main [role=combobox]').nth(1);
  const before = await likelihood.evaluate(e => e.closest('[role=group]')?.innerText || '');
  await press(likelihood);
  await sleep(500);
  await press(page.getByRole('option', { name: option, exact: true }));
  await sleep(2500);
  await page.getByText('All changes saved').first().waitFor({ timeout: 15000 });
  await press(page.getByRole('button', { name: 'review', exact: true }));
  await sleep(2000);
  await press(page.getByRole('button', { name: 'Complete assessment', exact: true }));
  await page.waitForURL(/risk-management\/details\//, { timeout: 15000 });
  console.log(JSON.stringify({ id, field: 'likelihood', before: before.replace(/\s+/g, ' '), after: option }));
  process.exit(0);
})().catch(e => { console.error('ERR', e.message.split('\n')[0]); process.exit(1); });
