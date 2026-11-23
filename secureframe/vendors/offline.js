'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '../..');
const vendorsRoot = path.join(root, 'vendors');
const template = require('./questions.v1.json');

function vendorDir(slug) {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(slug || '')) throw new Error('Vendor folder must be a simple lowercase slug');
  return path.join(vendorsRoot, slug);
}

function filesUnder(dir, depth = 8) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) return depth > 0 ? filesUnder(file, depth - 1) : [];
    return entry.isFile() ? [file] : [];
  });
}

function classify(file) {
  const name = path.basename(file).toLowerCase();
  if (!/\.(pdf|docx?|zip)$/i.test(name)) return null;
  if (/bridge/.test(name)) return 'bridge';
  if (/soc.?3|soc.?iii/.test(name)) return 'soc3';
  if (/(soc.?2|soc.?ii|type.?ii|type.?2)/.test(name) &&
      !/(engagement|nda|agreement|faq|form)/.test(name)) return 'soc2-candidate';
  return 'other';
}

function sources(slug) {
  const content = fs.readFileSync(path.join(vendorsRoot, 'SOC2-sources.md'), 'utf8');
  const normalize = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const wanted = normalize(slug);
  return content.split('\n').filter(line => line.startsWith('| ')).flatMap(line => {
    const columns = line.split('|').slice(1, -1).map(x => x.trim());
    if (normalize(columns[0] || '') !== wanted) return [];
    const url = columns[2]?.match(/https?:\/\/[^\s)]+/)?.[0];
    return [{ vendor: columns[0], url: url || null, access: columns[3] || '', notes: columns[4] || '' }];
  });
}

function inventory(slug) {
  const dir = vendorDir(slug);
  const names = [slug, ...sources(slug).map(source => source.vendor)]
    .map(name => name.toLowerCase().replace(/[^a-z0-9]/g, ''));
  const documents = filesUnder(dir).flatMap(file => {
    const type = classify(file);
    return type ? [{ path: path.relative(root, file), type, bytes: fs.statSync(file).size }] : [];
  });
  const otherLocalCandidates = [
    ...filesUnder(vendorsRoot, 3),
    ...filesUnder(path.join(require('node:os').homedir(), 'Downloads'), 1),
  ].filter(file => !file.startsWith(dir + path.sep) && classify(file) &&
    names.some(name => name.length > 2 && path.basename(file).toLowerCase().replace(/[^a-z0-9]/g, '').includes(name)))
    .map(file => ({ path: file.startsWith(root) ? path.relative(root, file) : file, type: classify(file) }));
  return {
    vendorSlug: slug,
    directory: path.relative(root, dir),
    directoryExists: fs.existsSync(dir),
    documents,
    otherLocalCandidates,
    hasSoc2Candidate: documents.some(d => d.type === 'soc2-candidate'),
    sources: sources(slug),
  };
}

function prepare(vendorId, slug) {
  const current = inventory(slug);
  return {
    vendorId,
    vendorSlug: slug,
    questionTemplateVersion: template.version,
    reviewUrl: null,
    evidence: current.documents.map(d => d.path),
    evidenceNotes: '',
    questions: template.questions.map(q => ({ ...q, answer: '' })),
    assessment: { comments: [] },
  };
}

function validate(input, { requireReviewUrl = false } = {}) {
  const errors = [];
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input.vendorId || ''))
    errors.push('Vendor ID missing or invalid');
  if (!/^[a-z0-9][a-z0-9-]*$/.test(input.vendorSlug || '')) errors.push('Vendor folder slug missing or invalid');
  if (!input.reviewName?.trim()) errors.push('Review name missing');
  if (input.questionTemplateVersion !== template.version) errors.push('Question template version changed');
  if (!Array.isArray(input.questions) || input.questions.length !== template.questions.length) {
    errors.push(`Expected ${template.questions.length} questions`);
  } else {
    for (const expected of template.questions) {
      const actual = input.questions.find(q => q.number === expected.number);
      if (!actual || actual.question !== expected.question) errors.push(`Question ${expected.number} differs from template`);
      if (!actual?.answer?.trim()) errors.push(`Question ${expected.number} has no answer`);
    }
  }
  if (!Array.isArray(input.evidence) || !input.evidence.length) errors.push('No local evidence listed');
  else for (const file of input.evidence) {
    const resolved = typeof file === 'string' ? path.resolve(root, file) : '';
    if (typeof file !== 'string' || path.isAbsolute(file) || !resolved.startsWith(root + path.sep) ||
        !fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) errors.push(`Evidence file unavailable: ${file}`);
  }
  if (input.assessment?.comments && (!Array.isArray(input.assessment.comments) ||
      input.assessment.comments.some(c => typeof c.text !== 'string' || !c.text.trim() || typeof c.finding !== 'boolean'))) {
    errors.push('Assessment comments need text and a boolean finding value');
  }
  if (requireReviewUrl && !input.reviewUrl) errors.push('Secureframe review URL missing');
  return errors;
}

function extract(input, outputDir) {
  const destination = path.resolve(outputDir);
  fs.mkdirSync(destination, { recursive: true, mode: 0o700 });
  const outputs = [];
  for (const [index, file] of (input.evidence || []).entries()) {
    if (!/\.pdf$/i.test(file)) continue;
    const source = path.resolve(root, file);
    if (!source.startsWith(root + path.sep) || !fs.existsSync(source)) throw new Error(`Missing PDF: ${file}`);
    const target = path.join(destination, `${String(index + 1).padStart(2, '0')}-${path.basename(file, '.pdf')}.txt`);
    execFileSync('pdftotext', ['-layout', source, target], { timeout: 120000 });
    fs.chmodSync(target, 0o600);
    outputs.push(target);
  }
  return outputs;
}

module.exports = { inventory, prepare, validate, extract, template, root };
