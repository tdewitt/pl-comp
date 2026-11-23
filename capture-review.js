const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function captureReviewTab() {
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
  
  console.log('Taking screenshot of review tab...');
  await page.screenshot({ path: 'review-tab.png', fullPage: true });
  console.log('Screenshot saved to review-tab.png');
  
  console.log('Saving HTML...');
  const html = await page.content();
  fs.writeFileSync('review-tab.html', html);
  console.log('HTML saved to review-tab.html');
  
  await browser.close();
  
  console.log('\nDone! Check review-tab.png and review-tab.html to see completion options.');
}

captureReviewTab().catch(console.error);
