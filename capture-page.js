const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function capture() {
  const userDataDir = path.join(__dirname, '.playwright-profile');
  
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
  
  await page.waitForTimeout(3000);
  
  console.log('Taking screenshot...');
  await page.screenshot({ path: 'r24-screenshot.png', fullPage: true });
  console.log('Screenshot saved to r24-screenshot.png');
  
  console.log('Saving HTML...');
  const html = await page.content();
  fs.writeFileSync('r24-page.html', html);
  console.log('HTML saved to r24-page.html');
  
  console.log('Closing browser...');
  await browser.close();
  
  console.log('\nDone! Please check r24-screenshot.png and r24-page.html');
}

capture().catch(console.error);
