const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  
  if (dryRun) console.log('=== DRY RUN MODE (no submissions) ===\n');
  
  const jsonPath = path.join(__dirname, 'secureframe-risk-writer-batch.json');
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  
  const records = data.assessments.filter(record => {
    if (record.risk_id === 'R-68') return false;
    if (record.execution.action !== 'complete_assessment' || !record.execution.approved) return false;
    return true;
  });
  
  console.log(`Found ${records.length} records to process\n`);
  
  const userDataDir = path.join(__dirname, '.playwright-profile');
  console.log('Using persistent profile at:', userDataDir);
  
  const browser = await chromium.launchPersistentContext(userDataDir, { 
    headless: false, 
    slowMo: 100,
    args: ['--window-size=1920,1080']
  });
  const page = browser.pages()[0] || await browser.newPage();
  
  console.log('\nNavigating to Secureframe...');
  await page.goto('https://app.secureframe.com/risk-management/register', { 
    waitUntil: 'domcontentloaded', 
    timeout: 60000 
  });
  await page.waitForTimeout(3000);
  
  const isLoginPage = await page.$('input[type="email"], button:has-text("Log in")');
  if (isLoginPage) {
    console.log('\n=== PLEASE LOG IN ===');
    console.log('Browser window is open. Please log in to Secureframe.');
    console.log('After logging in, press Enter in this terminal...\n');
    await page.pause();
  } else {
    console.log('Already logged in!\n');
  }
  
  const results = { success: [], failed: [] };
  
  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    console.log(`\n[${i + 1}/${records.length}] Processing ${record.risk_id}...`);
    
    let retries = 3;
    while (retries > 0) {
      try {
        await processRisk(page, record, dryRun);
        
        if (!dryRun) {
          console.log(`  ✓ ${record.risk_id} completed`);
          results.success.push(record.risk_id);
        } else {
          console.log(`  ✓ ${record.risk_id} dry run complete`);
        }
        
        break;
      } catch (error) {
        retries--;
        console.error(`  ✗ ${record.risk_id} failed (retries left: ${retries}):`, error.message);
        
        if (retries === 0) {
          results.failed.push({ risk_id: record.risk_id, error: error.message });
          await page.screenshot({ path: `error-${record.risk_id}.png` });
        } else {
          console.log('  Retrying in 5 seconds...');
          await page.waitForTimeout(5000);
        }
      }
    }
    
    await page.waitForTimeout(3000);
  }
  
  console.log('\n=== AUTOMATION COMPLETE ===');
  console.log(`Success: ${results.success.length}`);
  console.log(`Failed: ${results.failed.length}`);
  
  await browser.close();
}

async function processRisk(page, record, dryRun) {
  const { risk_id, secureframe_risk_id, details, assessment, treatment } = record;
  
  const baseUrl = `https://app.secureframe.com/risk-management/assessment/${secureframe_risk_id}`;
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(2000);
  
  console.log('  Filling Details tab...');
  await fillDetailsTab(page, details);
  
  console.log('  Filling Assessment tab...');
  await fillAssessmentTab(page, assessment);
  
  console.log('  Filling Treatment tab...');
  await fillTreatmentTab(page, treatment);
  
  if (!dryRun) {
    console.log('  Completing assessment...');
    await completeAssessment(page);
  } else {
    console.log('  Dry run - skipping submission');
  }
}

async function fillDetailsTab(page, details) {
  await page.click('button:has-text("Details")').catch(() => {});
  await page.waitForTimeout(1000);
  
  if (details.owner) {
    console.log(`    Setting owner: ${details.owner.name}`);
    const dropdown = await page.$('button[aria-label*="owner" i], [role="combobox"][aria-label*="owner" i]');
    if (dropdown) {
      await dropdown.click();
      await page.waitForTimeout(500);
      await page.fill('input[role="searchbox"]', details.owner.name);
      await page.waitForTimeout(1000);
      await page.click(`[role="option"]:has-text("${details.owner.name}")`).catch(() => {});
    }
  }
  
  if (details.cia && details.cia.length > 0) {
    console.log(`    Setting CIA: ${details.cia.join(', ')}`);
    for (const ciaItem of details.cia) {
      const checkbox = await page.$(`input[type="checkbox"][aria-label*="${ciaItem}" i]`);
      if (checkbox) await checkbox.check();
    }
  }
  
  await page.waitForTimeout(1000);
}

async function fillAssessmentTab(page, assessment) {
  await page.click('button:has-text("Assessment")').catch(() => {});
  await page.waitForTimeout(1000);
  
  console.log(`    Setting impact: ${assessment.impact} - ${assessment.impact_label}`);
  const impactDropdown = await page.$('button[aria-label*="Impact" i], [role="combobox"][aria-label*="impact" i]');
  if (impactDropdown) {
    await impactDropdown.click();
    await page.waitForTimeout(500);
    await page.click(`[role="option"]:has-text("${assessment.impact} -")`).catch(() => {});
  }
  
  if (assessment.impact_justification) {
    const textarea = await page.$('textarea[aria-label*="impact justification" i]');
    if (textarea) await textarea.fill(assessment.impact_justification);
  }
  
  await page.waitForTimeout(500);
  
  console.log(`    Setting likelihood: ${assessment.likelihood} - ${assessment.likelihood_label}`);
  const likelihoodDropdown = await page.$('button[aria-label*="Likelihood" i], [role="combobox"][aria-label*="likelihood" i]');
  if (likelihoodDropdown) {
    await likelihoodDropdown.click();
    await page.waitForTimeout(500);
    await page.click(`[role="option"]:has-text("${assessment.likelihood} -")`).catch(() => {});
  }
  
  if (assessment.likelihood_justification) {
    const textarea = await page.$('textarea[aria-label*="likelihood justification" i]');
    if (textarea) await textarea.fill(assessment.likelihood_justification);
  }
  
  await page.waitForTimeout(1000);
}

async function fillTreatmentTab(page, treatment) {
  await page.click('button:has-text("Treatment")').catch(() => {});
  await page.waitForTimeout(1000);
  
  console.log(`    Setting treatment: ${treatment.decision}`);
  const treatmentLabel = treatment.decision.charAt(0).toUpperCase() + treatment.decision.slice(1);
  const treatmentDropdown = await page.$('button[aria-label*="Treatment" i], [role="combobox"][aria-label*="treatment" i]');
  if (treatmentDropdown) {
    await treatmentDropdown.click();
    await page.waitForTimeout(500);
    await page.click(`[role="option"]:has-text("${treatmentLabel}")`).catch(() => {});
  }
  
  if (treatment.notes) {
    const textarea = await page.$('textarea[aria-label*="treatment notes" i]');
    if (textarea) await textarea.fill(treatment.notes);
  }
  
  if (treatment.residual_impact) {
    console.log(`    Setting residual impact: ${treatment.residual_impact}`);
    const dropdown = await page.$('button[aria-label*="Residual impact" i]');
    if (dropdown) {
      await dropdown.click();
      await page.waitForTimeout(500);
      await page.click(`[role="option"]:has-text("${treatment.residual_impact} -")`).catch(() => {});
    }
  }
  
  if (treatment.residual_likelihood) {
    console.log(`    Setting residual likelihood: ${treatment.residual_likelihood}`);
    const dropdown = await page.$('button[aria-label*="Residual likelihood" i]');
    if (dropdown) {
      await dropdown.click();
      await page.waitForTimeout(500);
      await page.click(`[role="option"]:has-text("${treatment.residual_likelihood} -")`).catch(() => {});
    }
  }
  
  await page.waitForTimeout(1000);
}

async function completeAssessment(page) {
  await page.click('button:has-text("Review")').catch(() => {});
  await page.waitForTimeout(1000);
  
  const completeButton = await page.$('button:has-text("Complete"), button:has-text("Submit")');
  if (completeButton) {
    await completeButton.click();
    await page.waitForTimeout(2000);
    console.log('    Assessment completed!');
  }
}

main().catch(console.error);
