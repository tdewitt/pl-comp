const { chromium } = require('playwright');

// Risks to archive (64 remaining after R-4 was archived)
const RISKS_TO_ARCHIVE = [
  // PCI DSS (7 remaining)
  'R-5', 'R-6', 'R-7', 'R-8', 'R-9', 'R-10', 'R-11',
  // Exact duplicates (3)
  'R-29', 'R-62', 'R-90',
  // Merge into parent (13)
  'R-25', 'R-33', 'R-15', 'R-56', 'R-66', 'R-77', 'R-50', 'R-103',
  'R-53', 'R-105', 'R-57', 'R-28', 'R-52',
  // Scope out (41, adjusted)
  'R-40', 'R-92', 'R-94', 'R-95', 'R-96', 'R-97', 'R-98', 'R-99', 'R-100',
  'R-41', 'R-42', 'R-61', 'R-74',
  'R-37', 'R-38', 'R-39',
  'R-45', 'R-75',
  'R-86',
  'R-13', 'R-44', 'R-70', 'R-78', 'R-59', 'R-89', 'R-108', 'R-18',
  'R-27', 'R-31', 'R-35', 'R-36', 'R-58', 'R-79', 'R-85',
  'R-80', 'R-102', 'R-32', 'R-43', 'R-47', 'R-93'
];

async function archiveRisk(page, riskId) {
  console.log(`Archiving ${riskId}...`);
  
  try {
    // Navigate to register page
    await page.goto('https://app.secureframe.com/risk-management/register', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    // Wait for search box and clear any filters
    await page.waitForSelector('input[type="search"]', { timeout: 5000 });
    
    // Clear search box
    const searchBox = page.locator('input[type="search"]').first();
    await searchBox.clear();
    await searchBox.fill(riskId);
    await searchBox.press('Enter');
    
    // Wait for search results
    await page.waitForTimeout(1000);
    
    // Find row actions button and click
    const rowActionsBtn = page.locator('button:has-text("show row actions")').first();
    await rowActionsBtn.waitFor({ timeout: 3000 });
    await rowActionsBtn.click();
    
    // Wait for menu and click Archive
    await page.waitForTimeout(500);
    const archiveOption = page.locator('[role="menuitem"]:has-text("Archive")').first();
    await archiveOption.click();
    
    // Wait for dialog and confirm
    await page.waitForTimeout(500);
    const archiveBtn = page.locator('button:has-text("Archive")').filter({ hasText: 'Archive' }).last();
    await archiveBtn.click();
    
    // Wait for archival to complete
    await page.waitForTimeout(1500);
    
    console.log(`✓ Successfully archived ${riskId}`);
    return true;
    
  } catch (error) {
    console.error(`✗ Error archiving ${riskId}: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log(`Starting archival of ${RISKS_TO_ARCHIVE.length} risks...`);
  
  // Connect to existing Chrome browser (CDP)
  // Start Chrome with: google-chrome --remote-debugging-port=9222
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || await context.newPage();
  
  console.log('Connected to existing browser session');
  console.log('Make sure you are logged into Secureframe in the Chrome window');
  
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
    await page.waitForTimeout(500);
  }
  
  console.log(`\nArchival complete!`);
  console.log(`Success: ${successCount}`);
  console.log(`Failed: ${failCount}`);
  
  await browser.close();
}

main().catch(console.error);
