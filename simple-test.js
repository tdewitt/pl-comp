const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function test() {
  const userDataDir = path.join(__dirname, '.playwright-profile');
  
  console.log('Opening browser...');
  const browser = await chromium.launchPersistentContext(userDataDir, { 
    headless: false, 
    slowMo: 100,
    args: ['--window-size=1920,1080']
  });
  
  console.log('Browser opened. Pages:', browser.pages().length);
  const page = browser.pages()[0] || await browser.newPage();
  
  console.log('Navigating to Secureframe...');
  await page.goto('https://app.secureframe.com/risk-management/register', { 
    waitUntil: 'domcontentloaded', 
    timeout: 60000 
  });
  
  console.log('Successfully navigated. URL:', page.url());
  console.log('Browser will stay open for 60 seconds...');
  
  await page.waitForTimeout(60000);
  
  console.log('Closing browser...');
  await browser.close();
  console.log('Done.');
}

test().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
