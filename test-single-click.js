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
  
  const page = browser.pages()[0] || await browser.newPage();
  
  console.log('Navigating to R-24 assessment...');
  await page.goto('https://app.secureframe.com/risk-management/assessment/f711a777-7f3f-48af-ae74-ec05827c2471', {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });
  
  console.log('Page loaded. URL:', page.url());
  await page.waitForTimeout(2000);
  
  console.log('Looking for Details tab...');
  const detailsTab = await page.$('button:has-text("Details")');
  console.log('Details tab found:', !!detailsTab);
  
  if (detailsTab) {
    console.log('Clicking Details tab...');
    await detailsTab.click();
    await page.waitForTimeout(2000);
    console.log('Clicked! Taking screenshot...');
    await page.screenshot({ path: 'details-tab-clicked.png' });
    console.log('Screenshot saved.');
  }
  
  console.log('\nBrowser will stay open for 2 minutes for inspection...');
  console.log('Please check the browser window and verify the Details tab opened.\n');
  
  await page.waitForTimeout(120000);
  
  await browser.close();
}

test().catch(console.error);
