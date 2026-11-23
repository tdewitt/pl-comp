const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const batchSize = 5;
  
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
      
      await page.waitForTimeout(2000);
    }
    
    console.log(`\nClosing browser after batch ${Math.floor(batchStart / batchSize) + 1}...`);
    await browser.close();
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  console.log('\n=== AUTOMATION COMPLETE ===');
  console.log(`Success: ${results.success.length}`);
  console.log(`Failed: ${results.failed.length}`);
}

async function processRisk(page, record, dryRun) {
  const { risk_id, secureframe_risk_id, details, assessment, treatment } = record;
  
  const baseUrl = `https://app.secureframe.com/risk-management/assessment/${secureframe_risk_id}`;
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(2000);
  
  await fillDetailsTab(page, details);
  await fillAssessmentTab(page, assessment);
  await fillTreatmentTab(page, treatment);
  
  if (!dryRun) {
    await completeAssessment(page);
  }
}

async function fillDetailsTab(page, details) {
  await page.click('button:has-text("Details")').catch(() => {});
  await page.waitForTimeout(1000);
  
  if (details.owner) {
    const dropdown = await page.$('button[aria-label*="owner" i], [role="combobox"][aria-label*="owner" i]');
    if (dropdown) {
      await dropdown.click();
      await page.waitForTimeout(500);
      await page.fill('input[role="searchbox"]', details.owner.name).catch(() => {});
      await page.waitForTimeout(1000);
      await page.click(`[role="option"]:has-text("${details.owner.name}")`).catch(() => {});
    }
  }
  
  if (details.cia && details.cia.length > 0) {
    for (const ciaItem of details.cia) {
      const checkbox = await page.$(`input[type="checkbox"][aria-label*="${ciaItem}" i]`);
      if (checkbox) await checkbox.check();
    }
  }
}

async function fillAssessmentTab(page, assessment) {
  await page.click('button:has-text("Assessment")').catch(() => {});
  await page.waitForTimeout(1000);
  
  const impactDropdown = await page.$('button[aria-label*="Impact" i]');
  if (impactDropdown) {
    await impactDropdown.click();
    await page.waitForTimeout(500);
    await page.click(`[role="option"]:has-text("${assessment.impact} -")`).catch(() => {});
  }
  
  if (assessment.impact_justification) {
    const textarea = await page.$('textarea[aria-label*="impact justification" i]');
    if (textarea) await textarea.fill(assessment.impact_justification);
  }
  
  const likelihoodDropdown = await page.$('button[aria-label*="Likelihood" i]');
  if (likelihoodDropdown) {
    await likelihoodDropdown.click();
    await page.waitForTimeout(500);
    await page.click(`[role="option"]:has-text("${assessment.likelihood} -")`).catch(() => {});
  }
  
  if (assessment.likelihood_justification) {
    const textarea = await page.$('textarea[aria-label*="likelihood justification" i]');
    if (textarea) await textarea.fill(assessment.likelihood_justification);
  }
}

async function fillTreatmentTab(page, treatment) {
  await page.click('button:has-text("Treatment")').catch(() => {});
  await page.waitForTimeout(1000);
  
  const treatmentLabel = treatment.decision.charAt(0).toUpperCase() + treatment.decision.slice(1);
  const treatmentDropdown = await page.$('button[aria-label*="Treatment" i]');
  if (treatmentDropdown) {
    await treatmentDropdown.click();
    await page.waitForTimeout(500);
    await page.click(`[role="option"]:has-text("${treatmentLabel}")`).catch(() => {});
  }
  
  if (treatment.notes) {
    const textarea = await page.$('textarea[aria-label*="treatment notes" i]');
    if (textarea) await textarea.fill(treatment.notes);
  }
}

async function completeAssessment(page) {
  await page.click('button:has-text("Review")').catch(() => {});
  await page.waitForTimeout(1000);
  
  const completeButton = await page.$('button:has-text("Complete"), button:has-text("Submit")');
  if (completeButton) {
    await completeButton.click();
    await page.waitForTimeout(2000);
  }
}

main().catch(console.error);
