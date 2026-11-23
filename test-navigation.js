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
  
  console.log('Navigating to risk register...');
  await page.goto('https://app.secureframe.com/risk-management/register', { 
    waitUntil: 'domcontentloaded', 
    timeout: 60000 
  });
  await page.waitForTimeout(3000);
  
  console.log('Current URL:', page.url());
  
  if (page.url().includes('login')) {
    console.log('Still on login page. Please log in manually.');
    console.log('Waiting 5 minutes...');
    await page.waitForTimeout(300000);
  } else {
    console.log('Already logged in!');
  }
  
  console.log('Navigating to R-24 assessment...');
  await page.goto('https://app.secureframe.com/risk-management/assessment/f711a777-7f3f-48af-ae74-ec05827c2471', {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });
  await page.waitForTimeout(3000);
  
  console.log('Assessment page URL:', page.url());
  console.log('Page title:', await page.title());
  
  console.log('Taking screenshot...');
  await page.screenshot({ path: 'assessment-page.png' });
  console.log('Screenshot saved.');
  
  console.log('Waiting 30 seconds before closing...');
  await page.waitForTimeout(30000);
  
  await browser.close();
}

test().catch(console.error);
