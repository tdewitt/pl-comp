const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testFillForm() {
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
  
  console.log('\n=== TESTING DETAILS TAB ===\n');
  
  await page.click('button:has-text("details")');
  await page.waitForTimeout(2000);
  
  console.log('Looking for owner dropdown...');
  const ownerDropdown = await page.$('button[aria-label*="owner" i]');
  console.log('Owner dropdown found:', !!ownerDropdown);
  
  if (ownerDropdown) {
    await ownerDropdown.click();
    await page.waitForTimeout(1000);
    
    console.log('Typing "Mike Guzewicz"...');
    await page.fill('input[role="searchbox"]', 'Mike Guzewicz');
    await page.waitForTimeout(1500);
    
    console.log('Selecting from dropdown...');
    await page.click('[role="option"]:has-text("Mike Guzewicz")');
    await page.waitForTimeout(1000);
    
    console.log('Owner should be set now.');
  }
  
  console.log('\nTaking screenshot of details tab...');
  await page.screenshot({ path: 'test-details-filled.png' });
  console.log('Screenshot saved to test-details-filled.png');
  
  console.log('\n=== TESTING ASSESSMENT TAB ===\n');
  
  await page.click('button:has-text("assessment")');
  await page.waitForTimeout(2000);
  
  console.log('Looking for impact dropdown...');
  const impactDropdown = await page.$('button[aria-label*="impact" i]');
  console.log('Impact dropdown found:', !!impactDropdown);
  
  if (impactDropdown) {
    await impactDropdown.click();
    await page.waitForTimeout(1000);
    
    console.log('Selecting "5 - Very High"...');
    await page.click('[role="option"]:has-text("5 -")');
    await page.waitForTimeout(1000);
  }
  
  console.log('\nTaking screenshot of assessment tab...');
  await page.screenshot({ path: 'test-assessment-filled.png' });
  console.log('Screenshot saved to test-assessment-filled.png');
  
  console.log('\nBrowser staying open for 2 minutes for inspection...');
  console.log('Please check the screenshots and verify data is filled in.\n');
  
  await page.waitForTimeout(120000);
  await browser.close();
}

testFillForm().catch(console.error);
