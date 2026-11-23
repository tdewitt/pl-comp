const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function analyze() {
  const userDataDir = path.join(__dirname, '.playwright-profile');
  
  const browser = await chromium.launchPersistentContext(userDataDir, { 
    headless: false, 
    slowMo: 100,
    args: ['--window-size=1920,1080']
  });
  
  const page = browser.pages()[0] || await browser.newPage();
  
  console.log('Navigating to R-24...');
  await page.goto('https://app.secureframe.com/risk-management/assessment/f711a777-7f3f-48af-ae74-ec05827c2471', {
    waitUntil: 'networkidle',
    timeout: 60000
  });
  
  console.log('Waiting for page to fully load...');
  await page.waitForTimeout(5000);
  
  console.log('\n=== EXTRACTING PAGE STRUCTURE ===\n');
  
  const structure = await page.evaluate(() => {
    const result = {
      tabs: [],
      buttons: [],
      inputs: [],
      textareas: [],
      selects: []
    };
    
    document.querySelectorAll('button, [role="tab"]').forEach(el => {
      const text = el.textContent.trim();
      if (text) result.tabs.push({ text, selector: el.tagName + (el.className ? '.' + el.className.split(' ').join('.') : '') });
    });
    
    document.querySelectorAll('input, textarea, select').forEach(el => {
      const info = {
        type: el.type || el.tagName,
        name: el.name || '',
        ariaLabel: el.getAttribute('aria-label') || '',
        placeholder: el.placeholder || '',
        id: el.id || ''
      };
      if (el.type === 'checkbox' || el.type === 'radio') {
        result.inputs.push(info);
      } else if (el.tagName === 'TEXTAREA') {
        result.textareas.push(info);
      } else if (el.tagName === 'SELECT') {
        result.selects.push(info);
      }
    });
    
    return result;
  });
  
  console.log('TABS/BUTTONS FOUND:');
  console.log(JSON.stringify(structure.tabs, null, 2));
  
  console.log('\nTEXTAREAS FOUND:');
  console.log(JSON.stringify(structure.textareas, null, 2));
  
  console.log('\nSELECTS FOUND:');
  console.log(JSON.stringify(structure.selects, null, 2));
  
  fs.writeFileSync('page-structure.json', JSON.stringify(structure, null, 2));
  console.log('\nSaved full structure to page-structure.json');
  
  console.log('\nBrowser will stay open for 2 minutes for inspection...');
  await page.waitForTimeout(120000);
  
  await browser.close();
}

analyze().catch(console.error);
