'use strict';

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const js = body => `(() => { ${body} })()`;

async function until(browser, action, accept, label) {
  for (let attempt = 0; attempt < 40; attempt++) {
    const result = await browser.evaluate(action);
    if (accept(result)) return result;
    await sleep(350);
  }
  throw new Error(`Timed out: ${label}`);
}

async function openReview(browser) {
  await until(browser, js(`
    if (location.pathname.endsWith('/review')) return 'READY';
    if (location.pathname.endsWith('/summary')) {
      const go = [...document.querySelectorAll('button')].find(x => x.innerText.trim() === 'Go to review');
      if (!go) return 'WAITING'; go.click(); return 'OPENING';
    }
    return 'WAITING';
  `), r => r === 'READY', 'opening internal review');
  return browser.url();
}

async function start(browser, vendorId, name) {
  const state = await until(browser, js(`
    const text = document.body.innerText;
    if (!text.includes('Security reviews')) return 'WAITING';
    const rows = [...document.querySelectorAll('tr[data-row-id]')];
    const current = rows.filter(r => r.innerText.includes('In progress'));
    if (current.length > 1) throw new Error('Multiple in-progress reviews; choose one manually');
    if (current.length === 1) {
      current[0].querySelector('a')?.click(); return 'EXISTING';
    }
    const create = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'Create one-time review');
    if (!create) return 'WAITING'; create.click(); return 'CREATING';
  `), r => ['EXISTING', 'CREATING'].includes(r), 'review list');
  if (state === 'EXISTING') {
    await until(browser, js(`return location.pathname.includes('/vendors/reviews/item/') ? true : false;`), Boolean, 'existing review');
    return { created: false, reviewUrl: await openReview(browser) };
  }
  const encodedName = Buffer.from(name, 'utf8').toString('base64');
  await until(browser, js(`
    if (location.pathname !== '/vendors/reviews/create-one-time-review/${vendorId}') return 'WAITING';
    const field = document.querySelector('input[placeholder="e.g. High-risk vendor review"]');
    if (!field) return 'WAITING';
    const name = new TextDecoder().decode(Uint8Array.from(atob('${encodedName}'), c => c.charCodeAt(0)));
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(field, name);
    field.dispatchEvent(new Event('input', {bubbles:true}));
    field.dispatchEvent(new Event('change', {bubbles:true}));
    const next = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'Next');
    if (!next || next.disabled) return 'WAITING'; next.click(); return 'NEXT';
  `), r => r === 'NEXT', 'review details');
  await until(browser, js(`
    const edit = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'Edit question sets');
    if (!edit) return 'WAITING'; edit.click(); return 'OPENED';
  `), r => r === 'OPENED', 'question set configuration');
  await until(browser, js(`
    const d = document.querySelector('[role="dialog"]');
    const box = d?.querySelector('input[role="combobox"]');
    if (!box) return 'WAITING'; box.click(); return 'OPENED';
  `), r => r === 'OPENED', 'internal question sets');
  await until(browser, js(`
    const option = [...document.querySelectorAll('[id*="-item-"]')].find(x => x.innerText.trim() === 'Default Template');
    if (!option) return 'WAITING'; option.click(); return 'SELECTED';
  `), r => r === 'SELECTED', 'Default Template');
  await until(browser, js(`
    const d = document.querySelector('[role="dialog"]');
    const selected = d?.querySelector('input[role="combobox"]')?.value;
    const external = [...d?.querySelectorAll('input[role="combobox"]') || []][1]?.value;
    if (selected !== 'Default Template' || external) throw new Error('Question set selection changed');
    const save = [...d.querySelectorAll('button')].find(b => b.innerText.trim() === 'Save');
    if (!save || save.disabled) return 'WAITING'; save.click(); return 'SAVED';
  `), r => r === 'SAVED', 'saving internal question set');
  await until(browser, js(`
    if (!document.body.innerText.includes('Default Template')) return 'WAITING';
    const create = [...document.querySelectorAll('button')].filter(b => b.innerText.trim() === 'Create');
    if (create.length !== 1 || create[0].disabled) return 'WAITING';
    create[0].click(); return 'CREATED';
  `), r => r === 'CREATED', 'creating review');
  await until(browser, js(`return location.pathname.includes('/vendors/reviews/item/') ? true : false;`), Boolean, 'created review');
  return { created: true, reviewUrl: await openReview(browser) };
}

module.exports = { start };
