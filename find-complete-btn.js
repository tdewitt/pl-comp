const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function findCompleteButton() {
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
  
  console.log('\n=== BUTTONS ON REVIEW TAB ===\n');
  
  const buttons = await page.evaluate(() => {
    const results = [];
    document.querySelectorAll('button').forEach(btn => {
      const text = btn.textContent.trim();
      if (text) results.push(text);
    });
    return results;
  });
  
  buttons.forEach((text, i) => console.log(`${i + 1}. "${text}"`));
  
  console.log('\n=== LOOKING FOR COMPLETION BUTTON ===\n');
  const completeButtons = buttons.filter(b => 
    b.toLowerCase().includes('complete') || 
    b.toLowerCase().includes('submit') ||
    b.toLowerCase().includes('finish')
  );
  
  if (completeButtons.length > 0) {
    console.log('Found completion-related buttons:', completeButtons);
  } else {
    console.log('No completion buttons found. All buttons:', buttons);
  }
  
  await browser.close();
}

findCompleteButton().catch(console.error);
