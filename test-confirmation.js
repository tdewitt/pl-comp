const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testCompletion() {
  const userDataDir = path.join(__dirname, '.playwright-profile');
  
  const browser = await chromium.launchPersistentContext(userDataDir, { 
    headless: false, 
    slowMo: 100,
    args: ['--window-size=1920,1080']
  });
  
  const page = browser.pages()[0] || await browser.newPage();
  
  console.log('Navigating to R-24...');
  await page.goto('https://app.secureframe.com/risk-management/assessment/f711a777-7f3f-48af-ae74-ec05827c2471', {
    waitUntil: 'networkidle',
    timeout: 60000
  });
  
  await page.waitForTimeout(3000);
  
  console.log('Clicking review tab...');
  await page.click('button:has-text("review")').catch(() => {});
  await page.waitForTimeout(2000);
  
  console.log('Clicking Complete assessment button...');
  await page.click('button:has-text("Complete assessment")').catch(() => {});
  await page.waitForTimeout(3000);
  
  console.log('Checking for confirmation dialog...');
  const dialogButtons = await page.evaluate(() => {
    const buttons = [];
    document.querySelectorAll('button').forEach(btn => {
      const text = btn.textContent.trim();
      if (text) buttons.push(text);
    });
    return buttons;
  });
  
  console.log('Buttons after clicking Complete:', dialogButtons.join(', '));
  
  console.log('\nBrowser staying open for 2 minutes...');
  console.log('Please check if a confirmation dialog appeared.\n');
  
  await page.waitForTimeout(120000);
  
  await browser.close();
}

testCompletion().catch(console.error);
