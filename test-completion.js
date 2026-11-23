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
  
  console.log('\n=== CHECKING REVIEW TAB ===\n');
  
  await page.click('button:has-text("review")').catch(() => {});
  await page.waitForTimeout(2000);
  
  console.log('Looking for completion buttons...');
  const buttons = await page.evaluate(() => {
    const btns = [];
    document.querySelectorAll('button').forEach(btn => {
      const text = btn.textContent.trim();
      if (text && text.length < 50) btns.push(text);
    });
    return btns;
  });
  
  console.log('Buttons found:', buttons.join(', '));
  
  console.log('\n=== INSTRUCTIONS ===');
  console.log('The browser is now open on R-24 assessment.');
  console.log('Please click through the workflow to complete the assessment.');
  console.log('Tell me: what button do you click to actually COMPLETE it (not save as draft)?\n');
  
  await page.waitForTimeout(300000);
  
  await browser.close();
}

testComplete().catch(console.error);
