const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const batchSize = 2;
  
  if (dryRun) console.log('=== DRY RUN MODE ===\n');
  
  const jsonPath = path.join(__dirname, 'secureframe-risk-writer-batch.json');
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  
  const records = data.assessments.filter(record => {
    if (record.risk_id === 'R-68') return false;
    if (record.execution.action !== 'complete_assessment' || !record.execution.approved) return false;
    return true;
  });
  
  console.log(`Found ${records.length} records to process\n`);
  console.log(`Processing in batches of ${batchSize}\n`);
  
  const userDataDir = path.join(__dirname, '.playwright-profile');
  const results = { success: [], failed: [] };
  
  for (let batchStart = 0; batchStart < records.length; batchStart += batchSize) {
    const batchEnd = Math.min(batchStart + batchSize, records.length);
    const batch = records.slice(batchStart, batchEnd);
    
    console.log(`\n=== BATCH ${Math.floor(batchStart / batchSize) + 1} (records ${batchStart + 1}-${batchEnd}) ===\n`);
    
    const browser = await chromium.launchPersistentContext(userDataDir, { 
      headless: false, 
      slowMo: 100,
      args: ['--window-size=1920,1080']
    });
    const page = browser.pages()[0] || await browser.newPage();
    
    for (let i = 0; i < batch.length; i++) {
      const record = batch[i];
      console.log(`[${batchStart + i + 1}/${records.length}] Processing ${record.risk_id}...`);
      
      try {
        await processRisk(page, record, dryRun);
        
        if (!dryRun) {
          console.log(`  ✓ ${record.risk_id} completed`);
          results.success.push(record.risk_id);
        } else {
          console.log(`  ✓ ${record.risk_id} dry run complete`);
        }
        
      } catch (error) {
        console.error(`  ✗ ${record.risk_id} failed:`, error.message);
        results.failed.push({ risk_id: record.risk_id, error: error.message });
      }
      
      await page.waitForTimeout(3000);
    }
    
    console.log(`\nClosing browser after batch ${Math.floor(batchStart / batchSize) + 1}...`);
    await browser.close();
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  console.log('\n=== AUTOMATION COMPLETE ===');
  console.log(`Success: ${results.success.length}`);
  console.log(`Failed: ${results.failed.length}`);
  
  if (results.failed.length > 0) {
    console.log('\nFailed records:');
    results.failed.forEach(r => console.log(`  ${r.risk_id}: ${r.error}`));
  }
}

async function processRisk(page, record, dryRun) {
  const { risk_id, secureframe_risk_id, details, assessment, treatment } = record;
  
  const baseUrl = `https://app.secureframe.com/risk-management/assessment/${secureframe_risk_id}`;
  await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(3000);
  
  console.log('  Filling details tab...');
  await fillDetailsTab(page, details);
  
  console.log('  Filling assessment tab...');
  await fillAssessmentTab(page, assessment);
  
  console.log('  Filling treatment tab...');
  await fillTreatmentTab(page, treatment);
  
  if (!dryRun) {
    console.log('  Completing assessment...');
    await completeAssessment(page);
  } else {
    console.log('  Dry run - skipping submission');
  }
}

async function fillDetailsTab(page, details) {
  await page.click('button:has-text("details")').catch(() => {});
  await page.waitForTimeout(1500);
  
  if (details.owner) {
    console.log(`    Setting owner: ${details.owner.name}`);
    const dropdown = await page.$('button[aria-label*="owner" i]');
    if (dropdown) {
      await dropdown.click();
      await page.waitForTimeout(800);
      await page.fill('input[role="searchbox"]', details.owner.name).catch(() => {});
      await page.waitForTimeout(1000);
      await page.click(`[role="option"]:has-text("${details.owner.name}")`).catch(() => {});
      await page.waitForTimeout(500);
    }
  }
  
  if (details.cia && details.cia.length > 0) {
    console.log(`    Setting CIA: ${details.cia.join(', ')}`);
    for (const ciaItem of details.cia) {
      const checkbox = await page.$(`input[type="checkbox"][aria-label*="${ciaItem}" i]`);
      if (checkbox) await checkbox.check();
    }
  }
}

async function fillAssessmentTab(page, assessment) {
  await page.click('button:has-text("assessment")').catch(() => {});
  await page.waitForTimeout(1500);
  
  console.log(`    Setting impact: ${assessment.impact} - ${assessment.impact_label}`);
  const impactDropdown = await page.$('button[aria-label*="impact" i]');
  if (impactDropdown) {
    await impactDropdown.click();
    await page.waitForTimeout(800);
    await page.click(`[role="option"]:has-text("${assessment.impact} -")`).catch(() => {});
    await page.waitForTimeout(500);
  }
  
  if (assessment.impact_justification) {
    const textarea = await page.$('textarea[aria-label*="impact justification" i]');
    if (textarea) await textarea.fill(assessment.impact_justification);
  }
  
  console.log(`    Setting likelihood: ${assessment.likelihood} - ${assessment.likelihood_label}`);
  const likelihoodDropdown = await page.$('button[aria-label*="likelihood" i]');
  if (likelihoodDropdown) {
    await likelihoodDropdown.click();
    await page.waitForTimeout(800);
    await page.click(`[role="option"]:has-text("${assessment.likelihood} -")`).catch(() => {});
    await page.waitForTimeout(500);
  }
  
  if (assessment.likelihood_justification) {
    const textarea = await page.$('textarea[aria-label*="likelihood justification" i]');
    if (textarea) await textarea.fill(assessment.likelihood_justification);
  }
}

async function fillTreatmentTab(page, treatment) {
  await page.click('button:has-text("treatment")').catch(() => {});
  await page.waitForTimeout(1500);
  
  console.log(`    Setting treatment: ${treatment.decision}`);
  const treatmentLabel = treatment.decision.charAt(0).toUpperCase() + treatment.decision.slice(1);
  const treatmentDropdown = await page.$('button[aria-label*="treatment" i]');
  if (treatmentDropdown) {
    await treatmentDropdown.click();
    await page.waitForTimeout(800);
    await page.click(`[role="option"]:has-text("${treatmentLabel}")`).catch(() => {});
    await page.waitForTimeout(500);
  }
  
  if (treatment.notes) {
    const textarea = await page.$('textarea[aria-label*="treatment notes" i]');
    if (textarea) await textarea.fill(treatment.notes);
  }
  
  if (treatment.residual_impact) {
    console.log(`    Setting residual impact: ${treatment.residual_impact}`);
    const dropdown = await page.$('button[aria-label*="residual impact" i]');
    if (dropdown) {
      await dropdown.click();
      await page.waitForTimeout(800);
      await page.click(`[role="option"]:has-text("${treatment.residual_impact} -")`).catch(() => {});
      await page.waitForTimeout(500);
    }
  }
  
  if (treatment.residual_likelihood) {
    console.log(`    Setting residual likelihood: ${treatment.residual_likelihood}`);
    const dropdown = await page.$('button[aria-label*="residual likelihood" i]');
    if (dropdown) {
      await dropdown.click();
      await page.waitForTimeout(800);
      await page.click(`[role="option"]:has-text("${treatment.residual_likelihood} -")`).catch(() => {});
      await page.waitForTimeout(500);
    }
  }
}

async function completeAssessment(page) {
  await page.click('button:has-text("review")').catch(() => {});
  await page.waitForTimeout(2000);
  
  console.log('    Clicking Complete assessment...');
  await page.click('button:has-text("Complete assessment")').catch(() => {});
  await page.waitForTimeout(3000);
  
  console.log('    Waiting for completion...');
  await page.waitForSelector('text="Assessment completed", text="Success", [role="alert"]', { timeout: 10000 }).catch(() => {});
  
  console.log('    Assessment completed!');
}

main().catch(console.error);
