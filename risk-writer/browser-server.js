// Launches a persistent headed Chromium on the saved Secureframe profile and exposes CDP on port 9333.
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const ctx = await chromium.launchPersistentContext(path.join(__dirname, '..', '.playwright-profile'), {
    headless: false,
    executablePath: process.env.CHROME_PATH || '/Users/tucker/Library/Caches/ms-playwright/chromium-1255/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
    viewport: { width: 1600, height: 1000 },
    args: ['--remote-debugging-port=9333'],
  });
  const page = ctx.pages()[0] || (await ctx.newPage());
  await page.goto('https://app.secureframe.com/risk-management/register');
  console.log('ready', page.url());
  await new Promise(() => {});
})();
