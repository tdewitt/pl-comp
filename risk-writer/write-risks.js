#!/usr/bin/env node
// Completes Secureframe risk assessments from secureframe-risk-writer-batch.json through the UI.
// Requires the browser from browser-server.js (logged in, CDP on :9333).
//
// Usage:
//   node write-risks.js                  # all approved complete_assessment risks not already completed
//   node write-risks.js --only R-14,R-16 # specific risks
//   node write-risks.js --dry-run        # list what would run
//
// Env: SECUREFRAME_API_KEY / SECUREFRAME_API_SECRET for read-API verification (optional).
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BATCH = path.join(__dirname, '..', 'secureframe-risk-writer-batch.json');
const LOG = path.join(__dirname, 'results.jsonl');
const BASE = 'https://app.secureframe.com/risk-management/assessment/';
const API = 'https://api.secureframe.com/risks/';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const onlyArg = args.find((a, i) => args[i - 1] === '--only');
const only = onlyArg ? new Set(onlyArg.split(',')) : null;

const sleep = ms => new Promise(r => setTimeout(r, ms));
const re = s => new RegExp('^' + s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$');

async function apiRisk(id) {
  const { SECUREFRAME_API_KEY: k, SECUREFRAME_API_SECRET: s } = process.env;
  if (!k || !s) return null;
  const r = await fetch(API + id, { headers: { Authorization: `${k} ${s}` } });
  return r.ok ? (await r.json()).data.attributes : null;
}

// Secureframe nav buttons sometimes fail actionability checks; fall back to a dispatched click.
async function press(loc) {
  await loc.scrollIntoViewIfNeeded().catch(() => {});
  await loc.click({ timeout: 5000 }).catch(() => loc.dispatchEvent('click'));
}

async function waitSaved(page) {
  for (let i = 0; i < 20; i++) {
    if (await page.getByText('All changes saved').first().isVisible().catch(() => false)) return;
    await sleep(500);
  }
  throw new Error('autosave did not settle');
}

async function pickOption(page, combobox, optionName) {
  await press(combobox);
  await sleep(500);
  await press(page.getByRole('option', { name: optionName, exact: true }));
  await sleep(500);
}

async function multiSelect(page, group, values) {
  const current = (await group.innerText()).split('\n').map(s => s.trim());
  // Option lists are virtualized, so off-screen options are absent from the DOM; scroll the menu until it renders.
  for (const v of values) {
    if (current.includes(v)) continue;
    const menuOpen = await page.locator('[role=option]').first().isVisible().catch(() => false);
    if (!menuOpen) await press(group.getByRole('button', { name: 'Toggle menu' }).first());
    await sleep(400);
    const opt = page.getByRole('option', { name: v, exact: true });
    for (let i = 0; i < 8 && !(await opt.isVisible().catch(() => false)); i++) {
      await page.locator('[role=option]').last().scrollIntoViewIfNeeded().catch(() => {});
      await page.mouse.wheel(0, 200);
      await sleep(300);
    }
    await press(opt);
    await sleep(400);
  }
  await page.keyboard.press('Escape');
  await sleep(500);
}

async function details(page, rec) {
  const d = rec.details;
  const owner = page.getByRole('group').filter({ hasText: '* Owner' });
  const ownerText = (await owner.innerText()) + ' ' + (await owner.getByRole('combobox').inputValue({ timeout: 1000 }).catch(() => ''))
    + ' ' + (await owner.getByRole('combobox').getAttribute('aria-label', { timeout: 1000 }).catch(() => ''));
  if (rec._apiOwner !== d.owner.id && !ownerText.includes(d.owner.name)) {
    await press(owner.getByRole('combobox'));
    await sleep(500);
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.press('Backspace');
    await page.keyboard.type(d.owner.name, { delay: 30 });
    await sleep(1200);
    await press(page.getByRole('option', { name: d.owner.name, exact: true }));
    await sleep(1000);
  }
  await page.mouse.move(5, 5);
  if (d.departments?.length) await multiSelect(page, page.getByRole('group').filter({ hasText: 'Departments' }), d.departments);
  if (d.cia?.length) {
    const cia = d.cia.map(c => c[0].toUpperCase() + c.slice(1));
    await multiSelect(page, page.getByRole('group').filter({ hasText: 'Confidentiality, integrity, and availability (CIA)' }), cia);
  }
  await waitSaved(page);
}

async function assessment(page, rec) {
  const a = rec.assessment;
  const combos = page.locator('main [role=combobox]');
  await pickOption(page, combos.nth(0), `${a.impact} - ${a.impact_label}`);
  await page.getByRole('textbox', { name: 'Impact justification' }).fill(a.impact_justification);
  await pickOption(page, combos.nth(1), `${a.likelihood} - ${a.likelihood_label}`);
  const lj = page.getByRole('textbox', { name: 'Likelihood justification' });
  await lj.fill(a.likelihood_justification);
  await lj.blur();
  await sleep(1500);
  await waitSaved(page);
}

async function treatment(page, rec) {
  const t = rec.treatment;
  const combos = page.locator('main [role=combobox]');
  await press(combos.nth(0));
  await sleep(500);
  await press(page.getByRole('option', { name: new RegExp('^' + t.decision + '$', 'i') }));
  await sleep(500);
  await page.getByRole('textbox', { name: 'Treatment notes' }).fill(t.notes);
  await pickOption(page, combos.nth(1), `${t.residual_impact} - ${t.residual_impact_label}`);
  await page.getByRole('textbox', { name: 'Residual impact justification' }).fill(t.residual_impact_justification);
  await pickOption(page, combos.nth(2), `${t.residual_likelihood} - ${t.residual_likelihood_label}`);
  const rl = page.getByRole('textbox', { name: 'Residual likelihood justification' });
  await rl.fill(t.residual_likelihood_justification);
  await rl.blur();
  await sleep(1500);
  await waitSaved(page);

  const mapped = {};
  if (t.control_keys?.length) {
    const open = page.getByRole('button', { name: /^(Map controls|Edit mapping)$/ }).first();
    await press(open);
    await sleep(1500);
    const search = page.getByPlaceholder('Search all controls...');
    const modal = page.locator('div').filter({ has: search }).filter({ hasText: 'Link controls to risk' }).last();
    for (const k of t.control_keys) {
      await search.fill('');
      await search.fill(k);
      await sleep(1800);
      const title = modal.getByText(k, { exact: true });
      const n = await title.count();
      if (n !== 1) { mapped[k] = `matches=${n}`; continue; }
      const row = title.locator('xpath=ancestor::*[.//button[normalize-space(.)="Add" or normalize-space(.)="Remove"]][1]');
      const btn = row.locator('button').filter({ hasText: /^(Add|Remove)$/ }).first();
      if ((await btn.innerText()).trim() === 'Add') { await press(btn); await sleep(1200); mapped[k] = 'added'; }
      else mapped[k] = 'already';
    }
    await page.keyboard.press('Escape');
    await sleep(1000);
  }
  return mapped;
}

// A completed risk must be reopened through the details page menu; Edit returns it to Draft.
async function reopen(page, rec) {
  await page.goto('https://app.secureframe.com/risk-management/details/' + rec.secureframe_risk_id);
  await page.getByRole('button', { name: /View comments/ }).waitFor();
  await page.getByRole('button', { name: /View comments/ }).locator('xpath=following::button[1]').click();
  await press(page.getByRole('menuitem', { name: 'Edit', exact: true }));
  await page.waitForURL(/risk-management\/assessment\//, { timeout: 15000 });
}

async function processRisk(page, rec) {
  if (rec._apiStatus === 'completed') await reopen(page, rec);
  else await page.goto(BASE + rec.secureframe_risk_id);
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.getByRole('button', { name: 'details', exact: true }).waitFor();
  if (page.url().includes('/login')) throw new Error('session expired: log in again in the browser window');

  await press(page.getByRole('button', { name: 'details', exact: true }));
  await sleep(1000);
  await details(page, rec);

  await press(page.getByRole('button', { name: 'assessment', exact: true }));
  await sleep(1500);
  await assessment(page, rec);

  await press(page.getByRole('button', { name: 'treatment', exact: true }));
  await sleep(1500);
  const controls = await treatment(page, rec);

  await press(page.getByRole('button', { name: 'review', exact: true }));
  await sleep(2000);
  await press(page.getByRole('button', { name: 'Complete assessment', exact: true }));
  await page.waitForURL(/risk-management\/details\//, { timeout: 15000 });
  return controls;
}

function check(rec, api) {
  if (!api) return ['api unavailable'];
  const p = [];
  if (api.status !== 'completed') p.push(`status=${api.status}`);
  if (api.owner_id !== rec.details.owner.id) p.push('owner');
  if (api.impact !== rec.assessment.impact) p.push('impact');
  if (api.likelihood !== rec.assessment.likelihood) p.push('likelihood');
  if (api.treatment !== rec.treatment.decision) p.push('treatment');
  if (api.residual_impact !== rec.treatment.residual_impact) p.push('residual_impact');
  if (api.residual_likelihood !== rec.treatment.residual_likelihood) p.push('residual_likelihood');
  const has = (got, want) => want.every(w => (got || []).map(x => x.toLowerCase()).includes(w.toLowerCase()));
  if (!has(api.departments, rec.details.departments || [])) p.push('departments');
  if (!has(api.cia, rec.details.cia || [])) p.push('cia');
  if (!api.impact_justification || !api.likelihood_justification) p.push('justifications');
  return p;
}

(async () => {
  const batch = JSON.parse(fs.readFileSync(BATCH, 'utf8'));
  // --only also selects update_assessment records: naming a risk explicitly is the approval.
  let recs = only
    ? batch.assessments.filter(r => only.has(r.risk_id) && ['complete_assessment', 'update_assessment'].includes(r.execution.action))
    : batch.assessments.filter(r => r.execution.approved && r.execution.action === 'complete_assessment');

  const todo = [];
  for (const r of recs) {
    const api = await apiRisk(r.secureframe_risk_id);
    if (!only && api?.status === 'completed' && check(r, api).length === 0) continue;
    todo.push(r);
  }
  console.log(`${todo.length} to process: ${todo.map(r => r.risk_id).join(' ')}`);
  if (dryRun) return;

  const browser = await chromium.connectOverCDP('http://localhost:9333');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('secureframe')) || browser.contexts()[0].pages()[0];
  page.setDefaultTimeout(10000);

  for (const rec of todo) {
    const started = new Date().toISOString();
    try {
      const before = await apiRisk(rec.secureframe_risk_id);
      rec._apiOwner = before?.owner_id;
      rec._apiStatus = before?.status;
      const controls = await processRisk(page, rec);
      const problems = check(rec, await apiRisk(rec.secureframe_risk_id));
      const ok = problems.length === 0 || problems[0] === 'api unavailable';
      console.log(`${ok ? 'OK  ' : 'WARN'} ${rec.risk_id} ${problems.join(',')} controls=${JSON.stringify(controls)}`);
      fs.appendFileSync(LOG, JSON.stringify({ risk_id: rec.risk_id, started, ok, problems, controls }) + '\n');
    } catch (e) {
      console.log(`FAIL ${rec.risk_id} ${e.message.split('\n')[0]}`);
      fs.appendFileSync(LOG, JSON.stringify({ risk_id: rec.risk_id, started, ok: false, error: e.message.split('\n')[0] }) + '\n');
      await page.screenshot({ path: path.join(__dirname, `fail-${rec.risk_id}.png`) }).catch(() => {});
    }
  }
  process.exit(0);
})();
