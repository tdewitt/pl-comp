const { chromium } = require('playwright');
const fs = require('fs');

async function checkPage() {
  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const context = await browser.newContext({ 
    storageState: fs.existsSync('auth-state.json') ? 'auth-state.json' : undefined
  });
  const page = await context.newPage();
  
  console.log('Navigating to Secureframe risk register...');
  await page.goto('https://app.secureframe.com/risk-management/register', { 
    waitUntil: 'domcontentloaded', 
    timeout: 60000 
  });
  
  console.log('Waiting for page to load...');
  await page.waitForTimeout(5000);
  
  console.log('Taking screenshot...');
  await page.screenshot({ path: 'secureframe-page.png', fullPage: true });
  console.log('Screenshot saved to secureframe-page.png');
  
  console.log('\nPage title:', await page.title());
  console.log('Current URL:', page.url());
  
  console.log('\nLooking for common elements...');
  const selectors = [
    'button:has-text("Details")',
    'button:has-text("Assessment")',
    'button:has-text("Treatment")',
    'button:has-text("Review")',
    '[role="tab"]',
    'nav',
    '[role="navigation"]',
    '.sidebar'
  ];
  
  for (const selector of selectors) {
    const count = await page.$$(selector);
    console.log(`${selector}: ${count.length} found`);
  }
  
  console.log('\nPage will stay open for 30 seconds for inspection...');
  await page.waitForTimeout(30000);
  
  await browser.close();
}

checkPage().catch(console.error);
