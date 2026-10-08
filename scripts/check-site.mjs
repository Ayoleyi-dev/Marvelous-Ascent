// Dependency-free checks for the GitHub Pages site.
// Run with: node scripts/check-site.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pages = [
  'index.html',
  'automated-lead-gen.html',
  'custom-bi-dashboards.html',
  'web-social-automation.html',
  'automated-document-processing.html'
];
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const files = new Set(fs.readdirSync(root));

for (const page of pages) {
  assert.ok(files.has(page), `Page missing: ${page}`);
  const markup = read(page);
  assert.match(markup, /<html lang="en"/, `Missing language on ${page}`);
  assert.match(markup, /href="brand\.css"/, `Brand stylesheet missing on ${page}`);
  assert.match(markup, /<title>.+<\/title>/, `Page title missing on ${page}`);
  for (const match of markup.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const target = match[1];
    if (/^(?:https?:|mailto:|tel:|data:|javascript:|\/\/|#)/i.test(target)) continue;
    const local = decodeURIComponent(target.split(/[?#]/)[0]);
    if (!local) continue;
    assert.ok(fs.existsSync(path.join(root, local)), `Broken local reference in ${page}: ${target}`);
  }
}
const homepage = read('index.html');
assert.match(homepage, /SAMPLE DATA/, 'Dashboard must be labelled as a sample');
assert.match(homepage, /fictional scenarios/i, 'Fictional use cases need a disclaimer');
assert.match(homepage, /mailto:meet\.ayoleyi@gmail\.com/, 'Direct email contact is required');
assert.doesNotMatch(homepage, /<span class="bi-live-badge">● LIVE<\/span>/, 'A sample cannot claim LIVE');
const scripts = read('ui-scripts.js');
assert.match(scripts, /safeName/, 'Local personalisation name must be escaped');
assert.match(scripts, /window\.location\.href = 'mailto:/, 'Contact form must open a draft');
console.log(`PASS: ${pages.length} pages, local references, labels and contact flow checked`);
