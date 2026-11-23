const { chromium } = require('playwright');

async function test() {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  console.log('Browser launched');
  
  const context = await browser.newContext();
  const page = await context.newPage();
  console.log('Page created');
  
  console.log('Navigating to Google...');
  await page.goto('https://www.google.com', { 
    waitUntil: 'load', 
    timeout: 30000 
  });
  console.log('Navigation to Google complete');
  
  console.log('Navigating to Secureframe...');
  await page.goto('https://app.secureframe.com/risk-management/register', { 
    waitUntil: 'domcontentloaded', 
    timeout: 60000 
  });
  console.log('Navigation to Secureframe complete');
  
  console.log('Waiting for page to settle...');
  await page.waitForTimeout(5000);
  
  console.log('Taking screenshot...');
  await page.screenshot({ path: 'test-screenshot.png' });
  console.log('Screenshot saved to test-screenshot.png');
  
  console.log('Waiting 10 seconds before closing...');
  await page.waitForTimeout(10000);
  
  await browser.close();
  console.log('Browser closed');
}

test().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
