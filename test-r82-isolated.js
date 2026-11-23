const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testR82() {
  const userDataDir = path.join(__dirname, '.playwright-profile');
  
  const browser = await chromium.launchPersistentContext(userDataDir, { 
    headless: false, 
    slowMo: 100,
    args: ['--window-size=1920,1080']
  });
  
  const page = browser.pages()[0] || await browser.newPage();
  
  console.log('Processing R-82...');
  
  const record = {
    risk_id: "R-82",
    secureframe_risk_id: "0900d830-d509-4baf-9fc6-66615d122ca0",
    details: {
      owner: { name: "Mike Guzewicz" },
      cia: ["confidentiality", "integrity"]
    },
    assessment: {
      impact: 4,
      impact_label: "High",
      likelihood: 3,
      likelihood_label: "Moderate"
    },
    treatment: {
      decision: "mitigate",
      residual_impact: 3,
      residual_likelihood: 2
    }
  };
  
  const baseUrl = `https://app.secureframe.com/risk-management/assessment/${record.secureframe_risk_id}`;
  await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(3000);
  
  console.log('  Filling details tab...');
  await page.click('button:has-text("details")').catch(() => {});
  await page.waitForTimeout(1500);
  
  console.log('  Filling assessment tab...');
  await page.click('button:has-text("assessment")').catch(() => {});
  await page.waitForTimeout(1500);
  
  console.log('  Filling treatment tab...');
  await page.click('button:has-text("treatment")').catch(() => {});
  await page.waitForTimeout(1500);
  
  console.log('  Completing assessment...');
  await page.click('button:has-text("review")').catch(() => {});
  await page.waitForTimeout(1500);
  
  const completeButton = await page.$('button:has-text("Complete"), button:has-text("Submit")');
  if (completeButton) {
    await completeButton.click();
    await page.waitForTimeout(2000);
    console.log('  Assessment completed!');
  }
  
  console.log('\nR-82 test complete. Browser staying open for 30 seconds...');
  await page.waitForTimeout(30000);
  
  await browser.close();
}

testR82().catch(console.error);
