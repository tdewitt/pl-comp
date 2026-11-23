const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testOneRecord() {
  const userDataDir = path.join(__dirname, '.playwright-profile');
  
  const browser = await chromium.launchPersistentContext(userDataDir, { 
    headless: false, 
    slowMo: 100,
    args: ['--window-size=1920,1080']
  });
  
  const page = browser.pages()[0] || await browser.newPage();
  
  const record = {
    risk_id: "R-24",
    secureframe_risk_id: "f711a777-7f3f-48af-ae74-ec05827c2471",
    details: {
      owner: { name: "Mike Guzewicz" },
      cia: ["confidentiality", "integrity", "availability"]
    },
    assessment: {
      impact: 5,
      impact_label: "Very High",
      likelihood: 4,
      likelihood_label: "High"
    },
    treatment: {
      decision: "mitigate",
      residual_impact: 4,
      residual_likelihood: 2
    }
  };
  
  console.log('Processing R-24 with screenshots at each step...\n');
  
  const baseUrl = `https://app.secureframe.com/risk-management/assessment/${record.secureframe_risk_id}`;
  await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'step1-loaded.png' });
  console.log('Step 1: Page loaded');
  
  await page.click('button:has-text("details")').catch(() => {});
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'step2-details.png' });
  console.log('Step 2: Details tab clicked');
  
  await page.click('button:has-text("assessment")').catch(() => {});
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'step3-assessment.png' });
  console.log('Step 3: Assessment tab clicked');
  
  await page.click('button:has-text("treatment")').catch(() => {});
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'step4-treatment.png' });
  console.log('Step 4: Treatment tab clicked');
  
  await page.click('button:has-text("review")').catch(() => {});
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'step5-review.png' });
  console.log('Step 5: Review tab clicked');
  
  console.log('Looking for Complete assessment button...');
  const completeBtn = await page.$('button:has-text("Complete assessment")');
  if (completeBtn) {
    console.log('Found Complete assessment button, clicking...');
    await completeBtn.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'step6-after-click.png' });
    console.log('Step 6: Clicked Complete assessment');
    
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'step7-after-wait.png' });
    console.log('Step 7: Waited 5 seconds');
  } else {
    console.log('ERROR: Complete assessment button not found!');
  }
  
  console.log('\nBrowser staying open for 2 minutes for inspection...');
  console.log('Check screenshots: step1.png through step7.png\n');
  
  await page.waitForTimeout(120000);
  await browser.close();
}

testOneRecord().catch(console.error);
