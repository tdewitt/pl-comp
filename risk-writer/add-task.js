#!/usr/bin/env node
// Adds a task to a Secureframe risk via the UI. No delivery (email/Jira/Slack) is selected and no due date is set.
// Requires the browser from browser-server.js (logged in, CDP on :9333).
// Usage: node add-task.js <secureframe_risk_id> <assignee name> <title> <description>
const { chromium } = require('playwright');

// The assignee combobox (downshift) closes its menu on synthetic clicks; real mouse events at measured positions work.
async function clickCenter(page, locator) {
  const r = await locator.boundingBox();
  await page.mouse.click(r.x + r.width / 2, r.y + r.height / 2);
}

(async () => {
  const [id, assignee, title, description] = process.argv.slice(2);
  const browser = await chromium.connectOverCDP('http://localhost:9333');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('secureframe'));
  page.setDefaultTimeout(10000);
  await page.goto('https://app.secureframe.com/risk-management/details/' + id);
  await page.getByText('Tasks', { exact: true }).first().click();
  await page.waitForTimeout(2000);
  if (await page.getByText(title, { exact: true }).count()) { console.log('exists', title); process.exit(0); }

  await clickCenter(page, page.getByRole('button', { name: 'Add task' }).first());
  await page.waitForTimeout(1500);
  await page.locator('input[name=title]:visible').fill(title);
  await page.locator('textarea[name=description]:visible').fill(description);

  await clickCenter(page, page.locator('input[role=combobox]:visible').last());
  await page.waitForTimeout(400);
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.press('Backspace');
  await page.keyboard.type(assignee, { delay: 40 });
  await page.waitForTimeout(1500);
  const opt = page.locator('[id^=downshift][id*=item]').filter({ hasText: new RegExp('^' + assignee + '$') }).first();
  await clickCenter(page, opt);
  await page.waitForTimeout(800);
  const chosen = await page.locator('input[role=combobox]:visible').last().inputValue();
  if (chosen !== assignee) throw new Error('assignee not set: ' + chosen);

  await clickCenter(page, page.locator('button:visible', { hasText: /^Add$/ }).last());
  await page.waitForTimeout(3000);
  console.log((await page.getByText(title, { exact: true }).count()) ? 'added' : 'NOT FOUND after add', '|', title);
  process.exit(0);
})().catch(e => { console.error('ERR', e.message.split('\n')[0]); process.exit(1); });
