const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testSingle() {
  const userDataDir = path.join(__dirname, '.playwright-profile');
  
  const browser = await chromium.launchPersistentContext(userDataDir, { 
    headless: false, 
    slowMo: 100,
    args: ['--window-size=1920,1080']
  });
  
  const page = browser.pages()[0] || await browser.newPage();
  
  console.log('Navigating to R-82 assessment...');
  await page.goto('https://app.secureframe.com/risk-management/assessment/0900d830-d509-4baf-9fc6-66615d122ca0', {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });
  
  console.log('Page loaded. URL:', page.url());
  await page.waitForTimeout(3000);
  
  console.log('Clicking Details tab...');
  await page.click('button:has-text("Details")').catch(e => console.log('Click failed:', e.message));
  await page.waitForTimeout(2000);
  
  console.log('Taking screenshot...');
  await page.screenshot({ path: 'r82-test.png' });
  console.log('Screenshot saved. Browser will stay open for 30 seconds...');
  
  await page.waitForTimeout(30000);
  await browser.close();
}

testSingle().catch(console.error);
