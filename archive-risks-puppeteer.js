const puppeteer = require('puppeteer');

// List of 65 risks to archive (adjusted based on decisions)
const RISKS_TO_ARCHIVE = [
  // PCI DSS (8)
  'R-4', 'R-5', 'R-6', 'R-7', 'R-8', 'R-9', 'R-10', 'R-11',
  // Exact duplicates (3)
  'R-29', 'R-62', 'R-90',
  // Merge into parent (13)
  'R-25', 'R-33', 'R-15', 'R-56', 'R-66', 'R-77', 'R-50', 'R-103',
  'R-53', 'R-105', 'R-57', 'R-28', 'R-52',
  // Scope out (41, adjusted: R-48 retained, R-47/R-102 scoped)
  'R-40', 'R-92', 'R-94', 'R-95', 'R-96', 'R-97', 'R-98', 'R-99', 'R-100',
  'R-41', 'R-42', 'R-61', 'R-74',
  'R-37', 'R-38', 'R-39',
  'R-45', 'R-75',
  'R-86',
  'R-13', 'R-44', 'R-70', 'R-78', 'R-59', 'R-89', 'R-108', 'R-18',
  'R-27', 'R-31', 'R-35', 'R-36', 'R-58', 'R-79', 'R-85',
  'R-80', 'R-102', 'R-32', 'R-43', 'R-47', 'R-93'
];

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function archiveRisk(page, riskId) {
  console.log(`Archiving ${riskId}...`);
  
  try {
    // Navigate to register page
    await page.goto('https://app.secureframe.com/risk-management/register', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Wait for search box
    await page.waitForSelector('input[type="search"], input[placeholder*="Search"]', { timeout: 5000 });
    
    // Clear and fill search box
    const searchBox = await page.$('input[type="search"], input[placeholder*="Search"]');
    await searchBox.click({ clickCount: 3 }); // Select all
    await searchBox.press('Backspace');
    await searchBox.type(riskId);
    await searchBox.press('Enter');
    
    // Wait for search results
    await sleep(1000);
    
    // Find and click row actions button
    const rowActionsBtn = await page.$('button[aria-label*="row actions"], button:has-text("show row actions")');
    if (!rowActionsBtn) {
      console.error(`Row actions button not found for ${riskId}`);
      return false;
    }
    await rowActionsBtn.click();
    
    // Wait for menu
    await sleep(500);
    
    // Click Archive option
    const archiveOption = await page.$('[role="menuitem"]:has-text("Archive")');
    if (!archiveOption) {
      console.error(`Archive option not found for ${riskId}`);
      return false;
    }
    await archiveOption.click();
    
    // Wait for dialog
    await sleep(500);
    
    // Click Archive button in dialog
    const archiveBtn = await page.$('button:has-text("Archive")');
    if (!archiveBtn) {
      console.error(`Archive confirm button not found for ${riskId}`);
      return false;
    }
    await archiveBtn.click();
    
    // Wait for archival to complete
    await sleep(1500);
    
    console.log(`Successfully archived ${riskId}`);
    return true;
    
  } catch (error) {
    console.error(`Error archiving ${riskId}:`, error.message);
    return false;
  }
}

async function main() {
  console.log(`Starting archival of ${RISKS_TO_ARCHIVE.length} risks...`);
  
  const browser = await puppeteer.launch({
    headless: false, // Set to true for headless mode
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  // Navigate to Secureframe (user needs to log in manually)
  await page.goto('https://app.secureframe.com');
  console.log('Please log in to Secureframe manually, then press Enter in this terminal...');
  
  // Wait for user to log in
  await new Promise(resolve => {
    process.stdin.once('data', () => resolve());
  });
  
  let successCount = 0;
  let failCount = 0;
  
  for (const riskId of RISKS_TO_ARCHIVE) {
    const success = await archiveRisk(page, riskId);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
    
    // Small delay between archives
    await sleep(500);
  }
  
  console.log(`\nArchival complete!`);
  console.log(`Success: ${successCount}`);
  console.log(`Failed: ${failCount}`);
  
  await browser.close();
}

main().catch(console.error);
