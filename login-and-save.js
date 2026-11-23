const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function main() {
  const userDataDir = path.join(__dirname, '.playwright-profile');
  console.log('Opening browser with persistent profile...');
  console.log('Profile location:', userDataDir);
  
  const browser = await chromium.launchPersistentContext(userDataDir, { 
    headless: false, 
    slowMo: 100,
    args: ['--window-size=1920,1080']
  });
  
  const page = browser.pages()[0] || await browser.newPage();
  
  console.log('\nNavigating to Secureframe...');
  await page.goto('https://app.secureframe.com/login', { 
    waitUntil: 'domcontentloaded', 
    timeout: 60000 
  });
  
  console.log('\n=== PLEASE LOG IN NOW ===');
  console.log('The browser window is open.');
  console.log('Please log in to Secureframe.');
  console.log('After logging in, this script will wait 30 seconds then close.');
  console.log('Your login session will be saved automatically.\n');
  
  await page.waitForTimeout(30000);
  
  console.log('Checking if login was successful...');
  if (page.url().includes('login')) {
    console.log('Still on login page. Please run this script again and log in.');
  } else {
    console.log('Login successful! Session saved.');
    console.log('You can now run the automation script.');
  }
  
  await browser.close();
}

main().catch(console.error);
