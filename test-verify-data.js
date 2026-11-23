const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testFillData() {
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
  
  console.log('\n=== FILLING DETAILS TAB ===\n');
  
  await page.click('button:has-text("details")');
  await page.waitForTimeout(2000);
  
  console.log('Clicking owner dropdown...');
  const ownerDropdown = await page.$('button[aria-label*="owner" i]');
  if (!ownerDropdown) {
    console.log('ERROR: Owner dropdown not found!');
    await page.screenshot({ path: 'error-no-owner-dropdown.png' });
    await browser.close();
    return;
  }
  
  await ownerDropdown.click();
  await page.waitForTimeout(1000);
  
  console.log('Typing owner name...');
  const searchInput = await page.$('input[role="searchbox"]');
  if (!searchInput) {
    console.log('ERROR: Search input not found!');
    await page.screenshot({ path: 'error-no-search-input.png' });
    await browser.close();
    return;
  }
  
  await searchInput.fill('Mike Guzewicz');
  await page.waitForTimeout(1500);
  
  console.log('Selecting owner...');
  await page.click('[role="option"]:has-text("Mike Guzewicz")');
  await page.waitForTimeout(1000);
  
  console.log('Owner should be set. Taking screenshot...');
  await page.screenshot({ path: 'test-owner-set.png' });
  
  console.log('\n=== FILLING ASSESSMENT TAB ===\n');
  
  await page.click('button:has-text("assessment")');
  await page.waitForTimeout(2000);
  
  console.log('Clicking impact dropdown...');
  const impactDropdown = await page.$('button[aria-label*="impact" i]');
  if (!impactDropdown) {
    console.log('ERROR: Impact dropdown not found!');
    await page.screenshot({ path: 'error-no-impact-dropdown.png' });
    await browser.close();
    return;
  }
  
  await impactDropdown.click();
  await page.waitForTimeout(1000);
  
  console.log('Selecting impact...');
  await page.click('[role="option"]:has-text("5 -")');
  await page.waitForTimeout(1000);
  
  console.log('Impact should be set. Taking screenshot...');
  await page.screenshot({ path: 'test-impact-set.png' });
  
  console.log('\n=== VERIFYING DATA IS FILLED ===\n');
  console.log('Check test-owner-set.png and test-impact-set.png to verify data is filled in.');
  console.log('Browser staying open for 3 minutes for inspection...\n');
  
  await page.waitForTimeout(180000);
  await browser.close();
}

testFillData().catch(err => {
  console.error('FATAL ERROR:', err.message);
  process.exit(1);
});
