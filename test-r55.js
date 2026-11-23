const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testR55() {
  const userDataDir = path.join(__dirname, '.playwright-profile');
  
  const browser = await chromium.launchPersistentContext(userDataDir, { 
    headless: false, 
    slowMo: 100,
    args: ['--window-size=1920,1080']
  });
  
  const page = browser.pages()[0] || await browser.newPage();
  
  console.log('Processing R-55...');
  
  const baseUrl = 'https://app.secureframe.com/risk-management/assessment/3b0d1c8d-5c3e-4b8a-9f2e-8c1d7a6b5e4f';
  await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(3000);
  
  console.log('Page loaded. URL:', page.url());
  console.log('Clicking details tab...');
  await page.click('button:has-text("details")').catch(() => {});
  await page.waitForTimeout(2000);
  
  console.log('Taking screenshot...');
  await page.screenshot({ path: 'r55-screenshot.png' });
  console.log('Screenshot saved to r55-screenshot.png');
  
  console.log('\nBrowser staying open for 60 seconds for inspection...');
  await page.waitForTimeout(60000);
  
  await browser.close();
}

testR55().catch(console.error);
