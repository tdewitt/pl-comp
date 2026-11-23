'use strict';

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const js = body => `(() => { ${body} })()`;

async function until(browser, action, accepted, label) {
  for (let attempt = 0; attempt < 40; attempt++) {
    const result = await browser.evaluate(action);
    if (accepted(result)) return result;
    await sleep(350);
  }
  throw new Error(`Timed out: ${label}`);
}

async function openQuestion(browser, number) {
  const result = await until(browser, js(`
    const d = document.querySelector('[role="dialog"]');
    if (d) {
      const q = d.querySelector('textarea')?.value;
      const row = [...document.querySelectorAll('tr[data-row-id]')].find(r => r.innerText.includes(q));
      if (row?.getAttribute('data-row-id')?.startsWith(${number} + '.')) return 'OPEN';
      d.querySelector('button[aria-label="close modal"]')?.click();
      return 'CLOSING';
    }
    const row = [...document.querySelectorAll('tr[data-row-id]')].find(r => r.getAttribute('data-row-id')?.startsWith(${number} + '.'));
    if (!row) return 'WAITING';
    const link = row.querySelector('a');
    if (!link) throw new Error('Question row has no link');
    link.click();
    return 'OPENING';
  `), result => result === 'OPEN', `opening question ${number}`);
  return result;
}

async function readQuestion(browser, number) {
  await openQuestion(browser, number);
  return browser.evaluate(js(`
    const d = document.querySelector('[role="dialog"]');
    const areas = [...d.querySelectorAll('textarea')];
    if (areas.length < 2) throw new Error('Question editor changed');
    return {number:${number}, question:areas[0].value, answer:areas[1].value,
      status:d.innerText.startsWith('Question\\nComplete') ||
        [...d.querySelectorAll('button')].some(b => b.innerText.trim() === 'Reopen') ? 'Complete' : 'Draft'};
  `));
}

async function snapshot(browser) {
  const questions = [];
  for (let number = 1; number <= 25; number++) questions.push(await readQuestion(browser, number));
  await browser.evaluate(js(`document.querySelector('[role="dialog"] button[aria-label="close modal"]')?.click(); return true;`));
  return questions;
}

async function applyAnswer(browser, item) {
  const number = item.number;
  const answer = item.answer;
  if (!Number.isInteger(number) || number < 1 || number > 25 || !answer?.trim()) {
    throw new Error(`Invalid answer for question ${number}`);
  }
  await openQuestion(browser, number);
  const actual = await browser.evaluate(js(`
    return document.querySelector('[role="dialog"] textarea')?.value || '';
  `));
  if (actual !== item.question) throw new Error(`Question ${number} changed since snapshot; export it again`);
  const encoded = Buffer.from(answer, 'utf8').toString('base64');
  const result = await until(browser, js(`
    const d = document.querySelector('[role="dialog"]');
    if (!d) return 'WAITING';
    const areas = [...d.querySelectorAll('textarea')];
    if (areas.length < 2) throw new Error('Question editor changed');
    const target = new TextDecoder().decode(Uint8Array.from(atob('${encoded}'), c => c.charCodeAt(0)));
    const reopen = [...d.querySelectorAll('button')].find(b => b.innerText.trim() === 'Reopen');
    if (reopen && areas[1].value === target) return 'UNCHANGED';
    if (reopen) { reopen.click(); return 'REOPENING'; }
    if (areas[1].value !== target) {
      Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(areas[1], target);
      areas[1].dispatchEvent(new Event('input', {bubbles:true}));
      return 'EDITING';
    }
    const complete = [...d.querySelectorAll('button')].find(b => b.innerText.trim() === 'Complete');
    if (!complete || complete.disabled) return 'WAITING';
    complete.click(); return 'COMPLETING';
  `), result => result === 'UNCHANGED' || result === 'COMPLETING', `saving question ${number}`);
  if (result === 'COMPLETING') {
    await until(browser, js(`
      const row = [...document.querySelectorAll('tr[data-row-id]')].find(r => r.getAttribute('data-row-id')?.startsWith(${number} + '.'));
      return row?.innerText.includes('Complete') ? 'SAVED' : 'WAITING';
    `), result => result === 'SAVED', `verifying question ${number}`);
  }
  return result;
}

async function addComment(browser, comment, finding = false) {
  if (!comment?.trim()) return 'SKIPPED';
  const encoded = Buffer.from(comment, 'utf8').toString('base64');
  await until(browser, js(`
    if (document.querySelector('[contenteditable="true"]')) return 'OPEN';
    const b = [...document.querySelectorAll('button')].find(x => x.innerText.trim() === 'Comments');
    if (!b) return 'WAITING'; b.click(); return 'OPENING';
  `), r => r === 'OPEN', 'opening comments');
  const result = await browser.evaluate(js(`
    const text = new TextDecoder().decode(Uint8Array.from(atob('${encoded}'), c => c.charCodeAt(0)));
    if (document.body.innerText.includes(text) && !document.querySelector('[contenteditable="true"]')?.innerText.trim()) return 'EXISTS';
    const checkbox = document.querySelector('input[data-castle="checkbox-input"]');
    if (!checkbox) throw new Error('Finding checkbox changed');
    if (checkbox.checked !== ${Boolean(finding)}) checkbox.click();
    const editor = document.querySelector('[contenteditable="true"]');
    editor.focus(); document.execCommand('selectAll'); document.execCommand('insertText', false, text);
    return 'ENTERED';
  `));
  if (result === 'EXISTS') return result;
  await until(browser, js(`
    const button = document.querySelector('button[aria-label="Add comment"]');
    if (!button || button.disabled) return 'WAITING'; button.click(); return 'SUBMITTED';
  `), r => r === 'SUBMITTED', 'submitting comment');
  await until(browser, js(`
    const text = new TextDecoder().decode(Uint8Array.from(atob('${encoded}'), c => c.charCodeAt(0)));
    const editor = document.querySelector('[contenteditable="true"]');
    return document.body.innerText.includes(text) && !editor?.innerText.trim() ? 'SAVED' : 'WAITING';
  `), r => r === 'SAVED', 'verifying comment');
  return 'SAVED';
}

async function finish(browser) {
  const comments = await browser.evaluate(js(`
    const close = document.querySelector('button[aria-label="Close comments"]');
    if (!close) return false;
    setTimeout(() => location.reload(), 150);
    return true;
  `));
  if (comments) await sleep(1200);
  await until(browser, js(`
    const summary = [...document.querySelectorAll('[role="dialog"]')].find(x => x.innerText.startsWith('Vendor review summary'));
    if (summary) return 'OPEN';
    const open = document.querySelector('[role="dialog"]');
    if (open) { open.querySelector('button[aria-label="close modal"]')?.click(); return 'CLOSING'; }
    const button = [...document.querySelectorAll('button')].find(x => x.innerText.trim() === 'Finish');
    if (!button) return 'WAITING'; button.click(); return 'OPENING';
  `), r => r === 'OPEN', 'opening review summary');
  const summary = await browser.evaluate(js(`
    const d = [...document.querySelectorAll('[role="dialog"]')].find(x => x.innerText.startsWith('Vendor review summary'));
    return d?.innerText || '';
  `));
  if (!summary.includes('100%\nQuestions completed')) throw new Error(`Review is incomplete: ${summary}`);
  await browser.evaluate(js(`
    const d = [...document.querySelectorAll('[role="dialog"]')].find(x => x.innerText.startsWith('Vendor review summary'));
    const button = [...d.querySelectorAll('button')].find(x => x.innerText.trim() === 'Finish');
    if (!button) throw new Error('Final Finish button missing'); button.click(); return 'SUBMITTED';
  `));
  return summary;
}

module.exports = { snapshot, applyAnswer, addComment, finish };
