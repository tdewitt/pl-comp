const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function test() {
  const userDataDir = path.join(__dirname, '.playwright-profile');
  
  console.log('Opening browser...');
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
  
  console.log('\n=== BROWSER IS NOW OPEN ===');
  console.log('Please look at the browser window.');
  console.log('The script is now PAUSED.\n');
  console.log('Tell me:');
  console.log('1. What do you see on the page?');
  console.log('2. Are there tabs/buttons for Details, Assessment, Treatment?');
  console.log('3. What is the exact text of the tabs you see?\n');
  console.log('Press Ctrl+C in this terminal when you are done inspecting.\n');
  
  await page.pause();
  
  await browser.close();
}

test().catch(console.error);
