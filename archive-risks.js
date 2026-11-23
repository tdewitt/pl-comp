// Archive risks script for Secureframe
// Run with: node archive-risks.js

const risksToArchive = [
  // PCI DSS (8)
  'R-4', 'R-5', 'R-6', 'R-7', 'R-8', 'R-9', 'R-10', 'R-11',
  // Exact duplicates (3)
  'R-29', 'R-62', 'R-90',
  // Merge into parent (13)
  'R-25', 'R-33', 'R-15', 'R-56', 'R-66', 'R-77', 'R-50', 'R-103',
  'R-53', 'R-105', 'R-57', 'R-28', 'R-52',
  // Scope out (41, adjusted: R-48 retained, R-47/R-102 scoped)
  'R-40', 'R-92', 'R-94', 'R-95', 'R-96', 'R-97', 'R-98', 'R-99', 'R-100',
  'R-41', 'R-42', 'R-61', 'R-74',
  'R-37', 'R-38', 'R-39',
  'R-45', 'R-75',
  'R-86',
  'R-13', 'R-44', 'R-70', 'R-78', 'R-59', 'R-89', 'R-108', 'R-18',
  'R-27', 'R-31', 'R-35', 'R-36', 'R-58', 'R-79', 'R-85',
  'R-80', 'R-102', 'R-32', 'R-43', 'R-47', 'R-93'
];

console.log(`Total risks to archive: ${risksToArchive.length}`);
console.log('Risk IDs:', risksToArchive.join(', '));

// This script documents the manual steps needed
// Since Chrome DevTools MCP doesn't have a direct "run script" function,
// we'll use the browser automation tools to execute these steps

const steps = `
MANUAL STEPS TO AUTOMATE:

1. Navigate to: https://app.secureframe.com/risk-management/register
2. For each risk ID in the list above:
   a. Click search box
   b. Type the risk ID (e.g., "R-5")
   c. Press Enter
   d. Wait for results
   e. Click "show row actions" button
   f. Click "Archive" in the menu
   g. Click "Archive" in the confirmation dialog
   h. Wait for archival to complete
3. Verify by checking the Archive tab

ALTERNATIVE: Use Chrome DevTools MCP to automate via evaluate_script

Example evaluate_script approach:
- Use document.querySelector() to find elements
- Use .click() to click buttons
- Use .value to fill text fields
`;

console.log(steps);
