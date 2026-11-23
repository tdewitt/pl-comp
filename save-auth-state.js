const { chromium } = require('playwright');
const fs = require('fs');

async function saveAuth() {
  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('Opening Secureframe login page...');
  await page.goto('https://app.secureframe.com/login', { 
    waitUntil: 'domcontentloaded', 
    timeout: 60000 
  });
  
  console.log('\n=== MANUAL LOGIN REQUIRED ===');
  console.log('Please log in to Secureframe in the browser window.');
  console.log('Once logged in, press Ctrl+C in this terminal or wait 5 minutes.\n');
  
  await page.waitForTimeout(300000);
  
  console.log('\nSaving authentication state...');
  await context.storageState({ path: 'auth-state.json' });
  console.log('Authentication saved to auth-state.json');
  console.log('You can now run the automation script without logging in again.');
  
  await browser.close();
}

saveAuth().catch(console.error);
