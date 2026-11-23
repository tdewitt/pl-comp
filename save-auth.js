const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function saveAuth() {
  const browser = await chromium.launch({ 
    headless: false, 
    slowMo: 100,
    args: ['--window-size=1920,1080']
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('Navigating to Secureframe...');
  await page.goto('https://app.secureframe.com/risk-management/register', {
    waitUntil: 'networkidle',
    timeout: 60000
  });
  
  console.log('\n=== PLEASE LOG IN ===');
  console.log('The browser is open. Please log in to Secureframe.');
  console.log('After logging in, press Enter in this terminal.\n');
  
  await page.pause();
  
  console.log('\nSaving authentication state...');
  await context.storageState({ path: 'auth-state.json' });
  console.log('Authentication saved to auth-state.json');
  
  await browser.close();
}

saveAuth().catch(console.error);
