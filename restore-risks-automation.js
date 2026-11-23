/**
 * Secureframe Risk Restoration Automation Script
 * 
 * This script automates restoring risks from the Archive to the Register in Secureframe.
 * It searches for each risk ID, clicks the three-dots menu, selects Restore, and confirms.
 * 
 * Usage: Paste this script into the browser console while on the Secureframe Archive page.
 */

(function() {
  // List of risk IDs to restore (from the plan)
  const riskIds = [
    'R-26', 'R-82', 'R-55', 'R-20', 'R-67', 'R-51', 'R-73', 'R-101', 'R-81',
    'R-34', 'R-12', 'R-69', 'R-30', 'R-104', 'R-83', 'R-2', 'R-54', 'R-88',
    'R-16', 'R-106', 'R-107', 'R-71', 'R-1', 'R-23', 'R-19', 'R-60', 'R-76',
    'R-63', 'R-64', 'R-65', 'R-68', 'R-87', 'R-91', 'R-109', 'R-22', 'R-21',
    'R-49', 'R-46', 'R-14', 'R-17', 'R-72', 'R-3', 'R-84'
  ];
  
  let currentIndex = 0;
  let successCount = 0;
  let failCount = 0;
  
  function restoreNextRisk() {
    if (currentIndex >= riskIds.length) {
      console.log(`\n=== RESTORATION COMPLETE ===`);
      console.log(`Success: ${successCount}, Failed: ${failCount}`);
      console.log(`Total processed: ${riskIds.length}`);
      return;
    }
    
    const riskId = riskIds[currentIndex];
    
    // Find search box
    const searchBox = document.querySelector('input[placeholder*="Search"], input[type="text"]');
    if (!searchBox) {
      console.error(`[${currentIndex + 1}/${riskIds.length}] Search box not found, stopping`);
      return;
    }
    
    // Clear search
    searchBox.value = '';
    searchBox.dispatchEvent(new Event('input', { bubbles: true }));
    
    setTimeout(() => {
      // Type risk ID
      searchBox.value = riskId;
      searchBox.dispatchEvent(new Event('input', { bubbles: true }));
      
      setTimeout(() => {
        // Find row with this risk ID
        const rows = Array.from(document.querySelectorAll('tr, [role="row"]'));
        const riskRow = rows.find(row => row.textContent.includes(riskId) && row.textContent.includes('R-'));
        
        if (!riskRow) {
          console.log(`[${currentIndex + 1}/${riskIds.length}] ${riskId} - NOT FOUND (may already be restored)`);
          failCount++;
          currentIndex++;
          setTimeout(restoreNextRisk, 500);
          return;
        }
        
        // Find three-dots menu button
        const menuButton = riskRow.querySelector('button[aria-label="show row actions"]');
        if (!menuButton) {
          console.log(`[${currentIndex + 1}/${riskIds.length}] ${riskId} - MENU BUTTON NOT FOUND`);
          failCount++;
          currentIndex++;
          setTimeout(restoreNextRisk, 500);
          return;
        }
        
        menuButton.click();
        
        setTimeout(() => {
          // Find and click Restore
          const restoreOption = Array.from(document.querySelectorAll('[role="menuitem"]'))
            .find(item => item.textContent.trim() === 'Restore');
          
          if (!restoreOption) {
            console.log(`[${currentIndex + 1}/${riskIds.length}] ${riskId} - RESTORE OPTION NOT FOUND`);
            failCount++;
            currentIndex++;
            document.body.click(); // Close menu
            setTimeout(restoreNextRisk, 500);
            return;
          }
          
          restoreOption.click();
          
          setTimeout(() => {
            // Find and click Confirm button
            const confirmButton = Array.from(document.querySelectorAll('button'))
              .find(btn => btn.textContent.trim() === 'Confirm' || btn.textContent.trim() === 'Restore');
            
            if (!confirmButton) {
              console.log(`[${currentIndex + 1}/${riskIds.length}] ${riskId} - CONFIRM BUTTON NOT FOUND`);
              failCount++;
              currentIndex++;
              setTimeout(restoreNextRisk, 500);
              return;
            }
            
            confirmButton.click();
            successCount++;
            console.log(`[${currentIndex + 1}/${riskIds.length}] ${riskId} - RESTORED ✓`);
            
            currentIndex++;
            // Wait 1 second before next restoration
            setTimeout(restoreNextRisk, 1000);
          }, 400);
        }, 300);
      }, 600);
    }, 300);
  }
  
  console.log(`Starting restoration of ${riskIds.length} risks...`);
  console.log('Make sure you are on the Archive page before running this script.\n');
  restoreNextRisk();
})();
