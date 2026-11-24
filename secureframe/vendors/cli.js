'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { createBrowser } = require('../core/browser');
const { inventory, prepare, validate, extract } = require('./offline');
const { queue } = require('./discovery');
const { start } = require('./start');
const review = require('./review');

const usage = `Vendor review workflow

  mise exec -- node secureframe/cli.js vendors queue [--all] [--browser brave|playwright]
  mise exec -- node secureframe/cli.js vendors inventory VENDOR_SLUG
  mise exec -- node secureframe/cli.js vendors prepare VENDOR_ID VENDOR_SLUG OUTPUT.json
  mise exec -- node secureframe/cli.js vendors extract INPUT.json OUTPUT_DIR
  mise exec -- node secureframe/cli.js vendors validate INPUT.json
  mise exec -- node secureframe/cli.js vendors start INPUT.json [--browser brave|playwright]
  mise exec -- node secureframe/cli.js vendors apply INPUT.json [--finish] [--browser brave|playwright]
  mise exec -- node secureframe/cli.js vendors status VENDOR_ID [--browser brave|playwright]
  mise exec -- node secureframe/cli.js vendors snapshot REVIEW_URL OUTPUT.json [--browser brave|playwright]`;

function uuid(value) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value || ''))
    throw new Error(`Expected vendor UUID, got ${value || '(missing)'}`);
  return value;
}

function reviewUrl(value) {
  let parsed;
  try { parsed = new URL(value); } catch { throw new Error('Full Secureframe review URL required'); }
  if (parsed.origin !== 'https://app.secureframe.com' ||
      !/^\/vendors\/reviews\/item\/[0-9a-f-]+\/review$/.test(parsed.pathname))
    throw new Error('Expected a Secureframe internal review URL ending in /review');
  return parsed.href;
}

function save(file, data) {
  const destination = path.resolve(file);
  const temp = `${destination}.${process.pid}.tmp`;
  fs.writeFileSync(temp, JSON.stringify(data, null, 2) + '\n', { mode: 0o600 });
  fs.renameSync(temp, destination);
  return destination;
}

function read(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }

function parse(args) {
  const values = [...args];
  const browserIndex = values.indexOf('--browser');
  const browser = browserIndex < 0 ? 'brave' : values.splice(browserIndex, 2)[1];
  const finishIndex = values.indexOf('--finish');
  const finish = finishIndex >= 0;
  if (finish) values.splice(finishIndex, 1);
  const allIndex = values.indexOf('--all');
  const all = allIndex >= 0;
  if (all) values.splice(allIndex, 1);
  if (!['brave', 'playwright'].includes(browser)) throw new Error('Browser must be brave or playwright');
  return { command:values[0], positional:values.slice(1), browser, finish, all };
}

async function status(browser) {
  for (let attempt = 0; attempt < 30; attempt++) {
    const result = await browser.evaluate(`(() => {
      const rows = [...document.querySelectorAll('tr')].map(r => r.innerText.trim().split('\\n'))
        .filter(cells => cells.length >= 7 && cells[0] !== 'Name');
      return { url: location.href, reviews: rows.map(cells => ({name:cells[0],
        type:cells[1], status:cells[4], started:cells[5], due:cells[6],
        completed:cells[7] || null})) };
    })()`);
    if (result.reviews.length) return result;
    await new Promise(resolve => setTimeout(resolve, 350));
  }
  throw new Error('No review rows loaded');
}

async function run(args) {
  const { command, positional, browser:mode, finish, all } = parse(args);
  if (!command || command === 'help' || command === '--help') { console.log(usage); return; }
  if (command === 'inventory') { console.log(JSON.stringify(inventory(positional[0]), null, 2)); return; }
  if (command === 'prepare') {
    if (!positional[2]) throw new Error('Output JSON path required');
    if (fs.existsSync(positional[2])) throw new Error('Output already exists; choose a new path to preserve reviewed answers');
    const data = prepare(uuid(positional[0]), positional[1]);
    data.reviewName = `${positional[1]} security review (${new Date().getFullYear()})`;
    console.log(`Prepared ${save(positional[2], data)} with ${data.evidence.length} local evidence files`);
    return;
  }
  if (command === 'validate') {
    const errors = validate(read(positional[0]));
    if (errors.length) throw new Error(errors.join('\n'));
    console.log('Offline review ready: fixed template, 25 answers, and local evidence verified.');
    return;
  }
  if (command === 'extract') {
    if (!positional[1]) throw new Error('Output directory required');
    const data = read(positional[0]);
    const missing = (data.evidence || []).filter(file => !fs.existsSync(path.resolve(__dirname, '../..', file)));
    if (missing.length) throw new Error(`Missing evidence: ${missing.join(', ')}`);
    console.log(JSON.stringify(extract(data, positional[1]), null, 2));
    return;
  }
  let url, data;
  if (['start', 'apply'].includes(command)) {
    if (!positional[0]) throw new Error('Input JSON path required');
    data = read(positional[0]);
    uuid(data.vendorId);
    if (command === 'apply') {
      const errors = validate(data, { requireReviewUrl:true });
      if (errors.length) throw new Error(errors.join('\n'));
    } else {
      if (!/^[a-z0-9][a-z0-9-]*$/.test(data.vendorSlug || '') || !data.reviewName?.trim())
        throw new Error('Start needs a vendor folder slug and review name');
      if (data.reviewUrl) throw new Error('Review already linked; use apply or clear reviewUrl deliberately');
    }
    url = command === 'start'
      ? `https://app.secureframe.com/vendors/details/${data.vendorId}/security-reviews`
      : reviewUrl(data.reviewUrl);
  } else if (command === 'queue') url = 'https://app.secureframe.com/vendors/active';
  else if (command === 'status') url = `https://app.secureframe.com/vendors/details/${uuid(positional[0])}/security-reviews`;
  else if (command === 'snapshot') {
    url = reviewUrl(positional[0]);
    if (!positional[1]) throw new Error('Output JSON path required');
  } else throw new Error(`Unknown vendor command: ${command}\n${usage}`);

  const browser = await createBrowser(mode, url);
  try {
    if (command === 'queue') {
      const result = await queue(browser);
      console.log(JSON.stringify(all ? result : { checkedAt:result.checkedAt, total:result.total,
        needsReview:result.needsReview }, null, 2));
    } else if (command === 'status') console.log(JSON.stringify(await status(browser), null, 2));
    else if (command === 'snapshot') {
      const questions = await review.snapshot(browser);
      console.log(`Saved ${questions.length} questions to ${save(positional[1], {reviewUrl:url, questions})}`);
    } else if (command === 'start') {
      const result = await start(browser, data.vendorId, data.reviewName);
      data.reviewUrl = reviewUrl(result.reviewUrl);
      save(positional[0], data);
      console.log(JSON.stringify(result, null, 2));
    } else if (command === 'apply') {
      // The review page renders after domcontentloaded; poll until its status line appears.
      let state = '';
      for (let attempt = 0; attempt < 60 && !/\n(In progress|Not started|Completed|Complete)\n/.test(state); attempt++) {
        state = await browser.evaluate(`(() => document.body.innerText.slice(0,900))()`);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      if (!state.includes('\nIn progress\n')) {
        throw new Error('Apply requires an in-progress review. Page header:\n' + state.slice(0, 400));
      }
      for (const item of [...data.questions].sort((a, b) => a.number - b.number))
        console.log(`Question ${item.number}: ${await review.applyAnswer(browser, item)}`);
      for (const [index, comment] of (data.assessment?.comments || []).entries())
        console.log(`Assessment comment ${index + 1}: ${await review.addComment(browser, comment.text, comment.finding)}`);
      if (finish) console.log(`Review submitted: ${await review.finish(browser)}`);
      else console.log('Answers saved. Inspect the review, then rerun with --finish.');
    }
  } finally { await browser.close(); }
}

module.exports = { run, usage };
