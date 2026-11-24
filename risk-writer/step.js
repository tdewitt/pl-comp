// Runs an inline async Playwright snippet against the live page: node step.js '<code using page>'
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('http://localhost:9333');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('secureframe'));
  page.setDefaultTimeout(10000);
  const fn = new Function('page', `return (async () => { ${process.argv[2]} })()`);
  const out = await fn(page);
  if (out !== undefined) console.log(typeof out === 'string' ? out : JSON.stringify(out, null, 1));
  process.exit(0);
})().catch(e => { console.error('ERR', e.message.split('\n')[0]); process.exit(1); });
