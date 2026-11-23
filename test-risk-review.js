/**
 * Test Script: Automate Risk Review for a Single Risk (R-24)
 * 
 * This script tests the automation on a single risk before running the full batch.
 * Run this script while on the Register page in Secureframe.
 */

(function() {
  const testRiskId = 'R-24';
  const testOwner = 'Tucker'; // Change to the actual owner name
  const testImpact = 4;
  const testLikelihood = 4;
  const testTreatment = 'Mitigate';
  
  console.log(`Testing risk review automation on ${testRiskId}...`);
  
  // Step 1: Find and click on the risk row to open assessment
  function openRiskAssessment() {
    return new Promise((resolve) => {
      // Search for the risk
      const searchBox = document.querySelector('input[placeholder*="Search"], input[type="text"]');
      if (!searchBox) {
        console.error('Search box not found');
        resolve(false);
        return;
      }
      
      searchBox.value = testRiskId;
      searchBox.dispatchEvent(new Event('input', { bubbles: true }));
      
      setTimeout(() => {
        // Click on the row
        const rows = Array.from(document.querySelectorAll('tr, [role="row"]'));
        const riskRow = rows.find(row => row.textContent.includes(testRiskId));
        
        if (!riskRow) {
          console.error(`Row not found for ${testRiskId}`);
          resolve(false);
          return;
        }
        
        // Click three-dots menu
        const menuButton = riskRow.querySelector('button[aria-label="show row actions"]');
        if (!menuButton) {
          console.error('Menu button not found');
          resolve(false);
          return;
        }
        
        menuButton.click();
        
        setTimeout(() => {
          // Click "Complete assessment"
          const assessmentOption = Array.from(document.querySelectorAll('[role="menuitem"]'))
            .find(item => item.textContent.includes('Complete assessment'));
          
          if (!assessmentOption) {
            console.error('Assessment option not found');
            document.body.click();
            resolve(false);
            return;
          }
          
          assessmentOption.click();
          console.log(`Opened assessment for ${testRiskId}`);
          
          // Wait for navigation
          setTimeout(() => resolve(true), 2000);
        }, 500);
      }, 1000);
    });
  }
  
  // Step 2: Fill in the assessment form
  async function fillAssessment() {
    console.log('Filling assessment form...');
    
    // Wait for form to load
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Click on Details tab and set owner
    console.log(`Setting owner to: ${testOwner}`);
    const detailsTab = Array.from(document.querySelectorAll('button'))
      .find(btn => btn.textContent.trim() === 'Details');
    if (detailsTab) detailsTab.click();
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Find owner dropdown
    const ownerDropdown = document.querySelector('[aria-label="Select user"]');
    if (ownerDropdown) {
      ownerDropdown.click();
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Type owner name
      const ownerInput = ownerDropdown.querySelector('input') || ownerDropdown;
      ownerInput.value = testOwner;
      ownerInput.dispatchEvent(new Event('input', { bubbles: true }));
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Select from dropdown
      const ownerOption = Array.from(document.querySelectorAll('[role="option"]'))
        .find(opt => opt.textContent.includes(testOwner));
      
      if (ownerOption) {
        ownerOption.click();
        console.log(`Owner set to: ${testOwner}`);
      } else {
        console.log(`Owner "${testOwner}" not found, skipping...`);
      }
    }
    
    // Click on Assessment tab and set scores
    console.log(`Setting impact: ${testImpact}, likelihood: ${testLikelihood}`);
    const assessmentTab = Array.from(document.querySelectorAll('button'))
      .find(btn => btn.textContent.trim() === 'Assessment');
    if (assessmentTab) assessmentTab.click();
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Set Impact
    const impactDropdown = document.querySelector('[aria-label*="Impact"]');
    if (impactDropdown) {
      impactDropdown.click();
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const impactOption = Array.from(document.querySelectorAll('[role="option"]'))
        .find(opt => opt.textContent.includes(`${testImpact} -`));
      
      if (impactOption) {
        impactOption.click();
        console.log(`Impact set to: ${testImpact}`);
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Set Likelihood
    const likelihoodDropdown = document.querySelector('[aria-label*="Likelihood"]');
    if (likelihoodDropdown) {
      likelihoodDropdown.click();
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const likelihoodOption = Array.from(document.querySelectorAll('[role="option"]'))
        .find(opt => opt.textContent.includes(`${testLikelihood} -`));
      
      if (likelihoodOption) {
        likelihoodOption.click();
        console.log(`Likelihood set to: ${testLikelihood}`);
      }
    }
    
    // Click on Treatment tab and set treatment
    console.log(`Setting treatment to: ${testTreatment}`);
    const treatmentTab = Array.from(document.querySelectorAll('button'))
      .find(btn => btn.textContent.trim() === 'Treatment');
    if (treatmentTab) treatmentTab.click();
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Set Treatment
    const treatmentDropdown = document.querySelector('[aria-label*="Treatment"]');
    if (treatmentDropdown) {
      treatmentDropdown.click();
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const treatmentOption = Array.from(document.querySelectorAll('[role="option"]'))
        .find(opt => opt.textContent.includes(testTreatment));
      
      if (treatmentOption) {
        treatmentOption.click();
        console.log(`Treatment set to: ${testTreatment}`);
      }
    }
    
    console.log('Assessment form filled successfully!');
    return true;
  }
  
  // Step 3: Save and exit
  function saveAndExit() {
    return new Promise((resolve) => {
      const exitButton = Array.from(document.querySelectorAll('button'))
        .find(btn => btn.textContent.includes('Exit assessment'));
      
      if (exitButton) {
        exitButton.click();
        console.log('Exiting assessment...');
        setTimeout(() => resolve(true), 2000);
      } else {
        console.error('Exit button not found');
        resolve(false);
      }
    });
  }
  
  // Run the test
  (async () => {
    const opened = await openRiskAssessment();
    if (!opened) {
      console.error('Failed to open assessment');
      return;
    }
    
    await fillAssessment();
    await saveAndExit();
    
    console.log('\n=== TEST COMPLETE ===');
    console.log('Check the results in Secureframe.');
  })();
})();
