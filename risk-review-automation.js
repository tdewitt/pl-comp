/**
 * Secureframe Risk Review Automation Script
 * 
 * This script automates the risk review process in Secureframe:
 * 1. Navigates to each risk in the register
 * 2. Opens the assessment form
 * 3. Fills in scoring (impact, likelihood)
 * 4. Assigns owners
 * 5. Sets treatment
 * 
 * Usage: 
 * 1. Navigate to the Register page
 * 2. Open the browser console
 * 3. Paste and run this script
 * 
 * Configuration:
 * - Update the riskScores object with the appropriate scores for each risk
 * - Update the ownerName with the name of the person to assign as owner
 */

(function() {
  // Configuration: Risk scores and assignments
  // Format: 'R-XX': { impact: 1-4, likelihood: 1-4, treatment: 'Accept'|'Mitigate'|'Transfer'|'Avoid', owner: 'User Name' }
  const riskScores = {
    'R-24': { impact: 4, likelihood: 4, treatment: 'Mitigate', owner: 'Tucker' },
    'R-26': { impact: 3, likelihood: 3, treatment: 'Mitigate', owner: 'Tucker' },
    'R-82': { impact: 3, likelihood: 3, treatment: 'Mitigate', owner: 'Tucker' },
    // Add more risks as needed...
  };
  
  // Default owner to assign if not specified in riskScores
  const defaultOwner = 'Tucker';
  
  let currentRiskIndex = 0;
  let riskIds = [];
  
  // Step 1: Get all risk IDs from the register
  function getRiskIdsFromRegister() {
    const rows = Array.from(document.querySelectorAll('tr, [role="row"]'));
    return rows
      .map(row => {
        const match = row.textContent.match(/R-\d+/);
        return match ? match[0] : null;
      })
      .filter(Boolean);
  }
  
  // Step 2: Navigate to a risk's assessment form
  function navigateToRiskAssessment(riskId) {
    return new Promise((resolve) => {
      // Click on the three-dots menu for the risk
      const rows = Array.from(document.querySelectorAll('tr, [role="row"]'));
      const riskRow = rows.find(row => row.textContent.includes(riskId));
      
      if (!riskRow) {
        console.error(`Row not found for ${riskId}`);
        resolve(false);
        return;
      }
      
      // Click the three-dots menu
      const menuButton = riskRow.querySelector('button[aria-label="show row actions"]');
      if (!menuButton) {
        console.error(`Menu button not found for ${riskId}`);
        resolve(false);
        return;
      }
      
      menuButton.click();
      
      setTimeout(() => {
        // Click "Complete assessment"
        const assessmentOption = Array.from(document.querySelectorAll('[role="menuitem"]'))
          .find(item => item.textContent.includes('Complete assessment'));
        
        if (!assessmentOption) {
          console.error(`Assessment option not found for ${riskId}`);
          document.body.click(); // Close menu
          resolve(false);
          return;
        }
        
        assessmentOption.click();
        
        // Wait for navigation to assessment form
        setTimeout(() => {
          resolve(true);
        }, 2000);
      }, 500);
    });
  }
  
  // Step 3: Fill in the assessment form
  async function fillAssessmentForm(riskId) {
    const score = riskScores[riskId] || { 
      impact: 3, 
      likelihood: 3, 
      treatment: 'Mitigate', 
      owner: defaultOwner 
    };
    
    console.log(`Filling assessment for ${riskId}...`);
    
    // Wait for form to load
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Fill Details tab (Owner)
    if (score.owner) {
      console.log(`  Setting owner: ${score.owner}`);
      // Click on Details tab
      const detailsTab = document.querySelector('button[aria-label="Details"], button:has-text("Details")');
      if (detailsTab) detailsTab.click();
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Find and fill owner dropdown
      const ownerDropdown = document.querySelector('[aria-label="Select user"], [name="owner"]');
      if (ownerDropdown) {
        ownerDropdown.click();
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Type owner name
        const ownerInput = ownerDropdown.querySelector('input') || ownerDropdown;
        ownerInput.value = score.owner;
        ownerInput.dispatchEvent(new Event('input', { bubbles: true }));
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Select from dropdown
        const ownerOption = Array.from(document.querySelectorAll('[role="option"]'))
          .find(opt => opt.textContent.includes(score.owner));
        
        if (ownerOption) {
          ownerOption.click();
          console.log(`  Owner set to: ${score.owner}`);
        } else {
          console.log(`  Owner "${score.owner}" not found in dropdown`);
        }
      }
    }
    
    // Fill Assessment tab (Impact and Likelihood)
    console.log(`  Setting impact: ${score.impact}, likelihood: ${score.likelihood}`);
    
    // Click on Assessment tab
    const assessmentTab = Array.from(document.querySelectorAll('button'))
      .find(btn => btn.textContent.trim() === 'Assessment');
    if (assessmentTab) assessmentTab.click();
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Set Impact
    const impactDropdown = document.querySelector('[aria-label*="Impact"], [name="impact"]');
    if (impactDropdown) {
      impactDropdown.click();
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const impactOption = Array.from(document.querySelectorAll('[role="option"]'))
        .find(opt => opt.textContent.includes(`${score.impact} -`));
      
      if (impactOption) {
        impactOption.click();
        console.log(`  Impact set to: ${score.impact}`);
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Set Likelihood
    const likelihoodDropdown = document.querySelector('[aria-label*="Likelihood"], [name="likelihood"]');
    if (likelihoodDropdown) {
      likelihoodDropdown.click();
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const likelihoodOption = Array.from(document.querySelectorAll('[role="option"]'))
        .find(opt => opt.textContent.includes(`${score.likelihood} -`));
      
      if (likelihoodOption) {
        likelihoodOption.click();
        console.log(`  Likelihood set to: ${score.likelihood}`);
      }
    }
    
    // Fill Treatment tab
    if (score.treatment) {
      console.log(`  Setting treatment: ${score.treatment}`);
      
      // Click on Treatment tab
      const treatmentTab = Array.from(document.querySelectorAll('button'))
        .find(btn => btn.textContent.trim() === 'Treatment');
      if (treatmentTab) treatmentTab.click();
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Set Treatment
      const treatmentDropdown = document.querySelector('[aria-label*="Treatment"], [name="treatment"]');
      if (treatmentDropdown) {
        treatmentDropdown.click();
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const treatmentOption = Array.from(document.querySelectorAll('[role="option"]'))
          .find(opt => opt.textContent.includes(score.treatment));
        
        if (treatmentOption) {
          treatmentOption.click();
          console.log(`  Treatment set to: ${score.treatment}`);
        }
      }
    }
    
    console.log(`  Assessment complete for ${riskId}`);
    return true;
  }
  
  // Step 4: Save and exit assessment
  function saveAndExit() {
    return new Promise((resolve) => {
      // Click "Exit assessment" button
      const exitButton = Array.from(document.querySelectorAll('button'))
        .find(btn => btn.textContent.includes('Exit assessment'));
      
      if (exitButton) {
        exitButton.click();
        console.log('  Exiting assessment...');
        
        // Wait for navigation back to register
        setTimeout(() => {
          resolve(true);
        }, 2000);
      } else {
        console.error('Exit button not found');
        resolve(false);
      }
    });
  }
  
  // Main automation loop
  async function processNextRisk() {
    if (currentRiskIndex >= riskIds.length) {
      console.log('\n=== RISK REVIEW COMPLETE ===');
      console.log(`Processed ${currentRiskIndex} risks`);
      return;
    }
    
    const riskId = riskIds[currentRiskIndex];
    console.log(`\n[${currentRiskIndex + 1}/${riskIds.length}] Processing ${riskId}...`);
    
    // Navigate to risk assessment
    const navigated = await navigateToRiskAssessment(riskId);
    if (!navigated) {
      console.error(`Failed to navigate to ${riskId}, skipping...`);
      currentRiskIndex++;
      setTimeout(processNextRisk, 1000);
      return;
    }
    
    // Fill assessment form
    await fillAssessmentForm(riskId);
    
    // Save and exit
    await saveAndExit();
    
    currentRiskIndex++;
    
    // Wait and process next risk
    setTimeout(processNextRisk, 1500);
  }
  
  // Start automation
  console.log('Starting risk review automation...');
  console.log('Make sure you are on the Register page with all risks visible.\n');
  
  // Get risk IDs from the register
  riskIds = getRiskIdsFromRegister();
  console.log(`Found ${riskIds.length} risks in the register.`);
  
  if (riskIds.length === 0) {
    console.error('No risks found. Make sure you are on the Register page.');
    return;
  }
  
  // Start processing
  processNextRisk();
})();
