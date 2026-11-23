const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function fillWithJS() {
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
  
  console.log('\n=== FILLING FORM WITH JAVASCRIPT ===\n');
  
  const result = await page.evaluate(() => {
    const results = {
      detailsTab: false,
      ownerSet: false,
      ciaSet: false,
      assessmentTab: false,
      impactSet: false,
      likelihoodSet: false
    };
    
    const detailsBtn = document.querySelector('button:has-text("details")');
    if (detailsBtn) {
      detailsBtn.click();
      results.detailsTab = true;
    }
    
    return results;
  });
  
  console.log('JavaScript execution result:', result);
  console.log('\nBrowser staying open for 2 minutes for inspection...');
  
  await page.waitForTimeout(120000);
  await browser.close();
}

fillWithJS().catch(console.error);
