// Step-by-step driver: connects to the running browser over CDP and runs one action.
// Usage: node drive.js <action> [args...]
//   goto <url> | snap [selector] | shot <file> | click <selector> | fill <selector> <text> | eval <js>
const { chromium } = require('playwright');
(async () => {
  const [action, ...args] = process.argv.slice(2);
  const browser = await chromium.connectOverCDP('http://localhost:9333');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('secureframe')) || browser.contexts()[0].pages()[0];
  page.setDefaultTimeout(15000);
  if (action === 'goto') { await page.goto(args[0]); await page.waitForLoadState('networkidle').catch(() => {}); console.log(page.url()); }
  if (action === 'snap') console.log(await page.locator(args[0] || 'body').ariaSnapshot());
  if (action === 'shot') { await page.screenshot({ path: args[0] }); console.log(args[0]); }
  if (action === 'click') { await page.locator(args[0]).first().click(); await page.waitForTimeout(800); console.log('clicked'); }
  if (action === 'fill') { await page.locator(args[0]).first().fill(args[1]); console.log('filled'); }
  if (action === 'eval') console.log(JSON.stringify(await page.evaluate(args[0]), null, 1));
  await browser.close().catch(() => {});
})().catch(e => { console.error(e.message); process.exit(1); });
