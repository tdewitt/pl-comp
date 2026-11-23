const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

function loadPlaywright() {
  const installDir = execFileSync('mise', ['where', 'npm:playwright'], { encoding: 'utf8' }).trim();
  return require(path.join(installDir, 'node_modules', 'playwright'));
}

async function main() {
  if (process.argv.includes('--help')) {
    console.log('Usage: mise exec -- node inspect-secureframe-policies.js [--headless]');
    console.log('Read-only inspection of the Secureframe policies list and one policy detail page.');
    return;
  }

  const { chromium } = loadPlaywright();
  const outputDir = path.join(__dirname, '.secureframe-policy-inspect');
  const profileDir = path.join(__dirname, '.secureframe-policy-profile');
  fs.mkdirSync(outputDir, { recursive: true });
  const context = await chromium.launchPersistentContext(profileDir, {
    headless: process.argv.includes('--headless'),
    viewport: { width: 1440, height: 1000 },
  });

  try {
    const page = context.pages()[0] || await context.newPage();
    page.on('pageerror', error => console.error(`Page error: ${error.message}`));
    page.on('requestfailed', request => console.error(`Request failed: ${request.url()} (${request.failure()?.errorText})`));
    await page.goto('https://app.secureframe.com/policies', {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
    await page.waitForFunction(() =>
      /\/login|\/sign-in|\/sso/i.test(location.pathname) || document.body.innerText.trim().length > 0,
      null,
      { timeout: 30000 },
    ).catch(() => {});

    if (/\/login|\/sign-in|\/sso/i.test(page.url())) {
      if (process.argv.includes('--headless')) throw new Error('Login required; run without --headless.');
      console.log('Please sign in to Secureframe in the opened browser. Waiting for /policies...');
      try {
        await page.waitForURL(url => url.hostname === 'app.secureframe.com' && !/\/login|\/sign-in|\/sso/i.test(url.pathname), {
          timeout: 300000,
          waitUntil: 'domcontentloaded',
        });
      } catch {
        throw new Error('Sign in was not completed before the browser closed or timed out.');
      }
      await page.goto('https://app.secureframe.com/policies', { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForFunction(() => document.body?.innerText.trim().length > 0, null, { timeout: 30000 });
    }

    await page.locator('body').waitFor();
    await page.screenshot({ path: path.join(outputDir, 'list.png'), fullPage: true });
    const list = await capture(page);
    fs.writeFileSync(path.join(outputDir, 'list.json'), JSON.stringify(list, null, 2));
    console.log(`Policies list: ${list.url}`);
    console.log(`Policy links found: ${list.policyLinks.length}`);
    if (!list.controls.length && !list.headings.length) {
      throw new Error('The policies page did not render. Check the screenshot and request errors.');
    }

    if (list.policyLinks.length) {
      await page.goto(list.policyLinks[0].href, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.locator('body').waitFor();
      await page.screenshot({ path: path.join(outputDir, 'detail.png'), fullPage: true });
      const detail = await capture(page);
      fs.writeFileSync(path.join(outputDir, 'detail.json'), JSON.stringify(detail, null, 2));
      console.log(`Sample policy: ${detail.url}`);
    }

    console.log(`Inspection files: ${outputDir}`);
  } finally {
    await context.close();
  }
}

async function capture(page) {
  return page.evaluate(() => {
    const visible = element => !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
    const summary = element => ({
      tag: element.tagName.toLowerCase(),
      role: element.getAttribute('role'),
      text: (element.innerText || element.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 180),
      ariaLabel: element.getAttribute('aria-label'),
      title: element.getAttribute('title'),
      href: element.getAttribute('href'),
      type: element.getAttribute('type'),
    });
    return {
      url: location.href,
      title: document.title,
      policyLinks: [...document.querySelectorAll('a[href]')]
        .filter(visible)
        .map(element => ({ href: new URL(element.href, location.href).href, text: element.innerText.trim() }))
        .filter(link => new URL(link.href).pathname.startsWith('/policies/')),
      controls: [...document.querySelectorAll('button, [role="button"], [role="menuitem"], [role="combobox"], select, input')]
        .filter(visible).map(summary),
      headings: [...document.querySelectorAll('h1, h2, h3, [role="heading"]')]
        .filter(visible).map(summary),
      ownerText: [...document.querySelectorAll('body *')]
        .filter(element => visible(element) && element.children.length === 0 && /owner|draft|save/i.test(element.textContent || ''))
        .slice(0, 80).map(element => ({
          ...summary(element),
          parent: summary(element.parentElement),
        })),
    };
  });
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
