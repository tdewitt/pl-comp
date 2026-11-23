// Secureframe Risk Archival Automation Script
// This script will be executed via Chrome DevTools evaluate_script

const ARCHIVE_LIST = [
  // PCI DSS (8)
  'R-4', 'R-5', 'R-6', 'R-7', 'R-8', 'R-9', 'R-10', 'R-11',
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

async function archiveRisk(riskId) {
  console.log(`Archiving ${riskId}...`);
  
  // Find and fill search box
  const searchBox = document.querySelector('textbox[role="searchbox"], input[type="search"], .search-input');
  if (!searchBox) {
    console.error('Search box not found');
    return false;
  }
  
  // Clear and type risk ID
  searchBox.value = riskId;
  searchBox.dispatchEvent(new Event('input', { bubbles: true }));
  
  // Press Enter
  searchBox.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  searchBox.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', bubbles: true }));
  
  // Wait for results
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Find and click row actions button
  const rowActionsBtn = document.querySelector('button[aria-label*="row actions"], button:has-text("show row actions")');
  if (!rowActionsBtn) {
    console.error(`Row actions button not found for ${riskId}`);
    return false;
  }
  rowActionsBtn.click();
  
  // Wait for menu
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Click Archive option
  const archiveOption = document.querySelector('menuitem:has-text("Archive"), [role="menuitem"]:has-text("Archive")');
  if (!archiveOption) {
    console.error(`Archive option not found for ${riskId}`);
    return false;
  }
  archiveOption.click();
  
  // Wait for dialog
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Click Archive button in dialog
  const archiveBtn = document.querySelector('button:has-text("Archive"), [role="button"]:has-text("Archive")');
  if (!archiveBtn) {
    console.error(`Archive confirm button not found for ${riskId}`);
    return false;
  }
  archiveBtn.click();
  
  // Wait for archival to complete
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  console.log(`Successfully archived ${riskId}`);
  return true;
}

async function archiveAllRisks() {
  console.log(`Starting archival of ${ARCHIVE_LIST.length} risks...`);
  
  let successCount = 0;
  let failCount = 0;
  
  for (const riskId of ARCHIVE_LIST) {
    const success = await archiveRisk(riskId);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
    
    // Small delay between archives
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`\nArchival complete!`);
  console.log(`Success: ${successCount}`);
  console.log(`Failed: ${failCount}`);
}

// Execute
archiveAllRisks();
