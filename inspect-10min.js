const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function test() {
  const userDataDir = path.join(__dirname, '.playwright-profile');
  
  const browser = await chromium.launchPersistentContext(userDataDir, { 
    headless: false, 
    slowMo: 100,
    args: ['--window-size=1920,1080']
  });
  
  const page = browser.pages()[0] || await browser.newPage();
  
  console.log('Navigating to R-24...');
  await page.goto('https://app.secureframe.com/risk-management/assessment/f711a777-7f3f-48af-ae74-ec05827c2471', {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });
  
  console.log('\nBROWSER IS OPEN - 10 MINUTES TO INSPECT');
  console.log('Please look at the page and describe what you see.\n');
  
  await page.waitForTimeout(600000);
  
  await browser.close();
}

test().catch(console.error);
