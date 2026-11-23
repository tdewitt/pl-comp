const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testComplete() {
  const userDataDir = path.join(__dirname, '.playwright-profile');
  
  const browser = await chromium.launchPersistentContext(userDataDir, { 
    headless: false, 
    slowMo: 100,
    args: ['--window-size=1920,1080']
  });
  
  const page = browser.pages()[0] || await browser.newPage();
  
  console.log('Navigating to R-24 assessment...');
  await page.goto('https://app.secureframe.com/risk-management/assessment/f711a777-7f3f-48af-ae74-ec05827c2471', {
    waitUntil: 'networkidle',
    timeout: 60000
  });
  
  await page.waitForTimeout(3000);
  
  console.log('Looking for completion buttons...');
  
  const buttons = await page.evaluate(() => {
    const results = [];
    document.querySelectorAll('button').forEach(btn => {
      results.push({
        text: btn.textContent.trim(),
        ariaLabel: btn.getAttribute('aria-label'),
        className: btn.className
      });
    });
    return results;
  });
  
  console.log('\nAll buttons on page:');
  buttons.forEach(b => {
    if (b.text && b.text.length < 50) console.log(`  "${b.text}" (aria-label: ${b.ariaLabel})`);
  });
  
  console.log('\nBrowser staying open for 2 minutes...');
  await page.waitForTimeout(120000);
  
  await browser.close();
}

testComplete().catch(console.error);
