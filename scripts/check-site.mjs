// Dependency-free checks for the public site, routes and proof-first claims.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const data = JSON.parse(fs.readFileSync(path.join(root,'data/services.json'),'utf8'));
const pages = [
  'index.html', 'services.html', 'work.html', 'work/sonofiam.html',
  'work/diams.html', 'project-brief.html',
  'automated-lead-gen.html', 'custom-bi-dashboards.html',
  'web-social-automation.html', 'automated-document-processing.html',
  ...data.map(s => 'services/'+s.slug+'.html')
];
const read = (file) => fs.readFileSync(path.join(root,file), 'utf8');
const seen = new Set();

for (const page of pages) {
  assert.ok(fs.existsSync(path.join(root,page)), 'Missing page: '+page);
  const html = read(page);
  const lower = html.toLowerCase();
  assert.match(html,/<html lang="en"/, 'Language missing: '+page);
  assert.match(lower, /<h1\b/, 'Heading missing: '+page);
  assert.match(html,/<meta name="description"/, 'Description missing: '+page);
  assert.match(html, /href="(?:\.\.\/)?brand\.css"/, 'Brand stylesheet missing: '+page);
  const title = html.match(/<title>([^<]+)<\/title>/i);
  assert.ok(title && title[1].trim(), 'Title missing: '+page);
  assert.ok(!seen.has(title[1]), 'Duplicate title: '+title[1]);
  seen.add(title[1]);
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const url = match[1];
    if (/^(?:https?:|mailto:|tel:|data:|javascript:|\/\/)/i.test(url)) continue;
    const [rel, fragment] = url.split('#');
    const local = decodeURIComponent((rel||'').split('?')[0]);
    const dest = path.resolve(root,path.dirname(page),local||'.');
    assert.ok(dest===root||dest.startsWith(root+path.sep), 'Bad relative path: '+url);
    if (local) assert.ok(fs.existsSync(dest), 'Broken link/asset in '+page+': '+url);
    if (fragment && (!local || dest.endsWith('.html'))) {
      const target = local ? fs.readFileSync(dest, 'utf8') : html;
      const id = decodeURIComponent(fragment);
      assert.ok(target.includes('id="'+id+'"'), 'Broken anchor in '+page+': '+url);
    }
  }
}
const home = read('index.html');
assert.match(home, /Let’s make work feel lighter/, 'Warm welcome headline missing');
assert.match(home, /href="work\/diams\.html"/, 'DIAMS case study missing');
assert.match(home, /href="work\/sonofiam\.html"/, 'SonofIAM case study missing');
assert.match(home, /href="project-brief\.html"/, 'Project intake link missing');
assert.match(home, /SAMPLE DATA/, 'Demo must be labelled sample data');
assert.doesNotMatch(home, /Metro Health Clinic|Nordic Retail Co\.|Premier Properties/, 'Fictional testimonials must not appear');
const diams = read('work/diams.html');
assert.match(diams, /12 linked functional workbook sheets/, 'DIAMS scope must be described');
assert.match(diams, /not as a separately contracted/, 'DIAMS role boundary required');
const doc = read('automated-document-processing.html');
assert.doesNotMatch(doc, /id="poc-upload-form"|AES-256 Encrypted/, 'Unimplemented document upload or claims resurfaced');
const brief = read('project-brief.html');
assert.match(brief, /id="brief-review"/, 'Form review missing');
assert.match(brief, /does not submit anything to a server/, 'Draft-only notice missing');
assert.equal((brief.match(/class="warm-intake-step"/g)||[]).length,3,'Expected 3 project-intake steps');
const ui = read('ui-scripts.js');
assert.match(ui, /safeName/, 'Local personalisation name escaping required');
assert.match(ui, /setAttribute\('aria-expanded'/, 'Mobile menu accessibility state required');
const briefJs = read('project-brief.js');
assert.match(briefJs, /encodeURIComponent\(body\)/, 'Email draft encoding missing');
assert.doesNotMatch(briefJs, /fetch\(|XMLHttpRequest/, 'Project brief must not claim persistence');
const sitemap = read('sitemap.xml');
for (const required of ['work.html','work/sonofiam.html','work/diams.html','project-brief.html']) {
  assert.ok(sitemap.includes('/'+required+'</loc>'),'Sitemap missing '+required);
}
console.log('PASS: '+pages.length+' pages, links, anchors, honest proof and safe project brief');
