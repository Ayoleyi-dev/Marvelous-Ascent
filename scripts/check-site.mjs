// Dependency-free static site and generated content validation.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const data=JSON.parse(fs.readFileSync(path.join(root,'data/services.json'),'utf8'));
const pages=[
  'index.html','services.html',
  'automated-lead-gen.html','custom-bi-dashboards.html',
  'web-social-automation.html','automated-document-processing.html',
  ...data.map(s=>'services/'+s.slug+'.html')
];
for(const page of pages){
 const file=path.join(root,page);
 assert.ok(fs.existsSync(file),`Page missing: ${page}`);
 const html=fs.readFileSync(file,'utf8');
 assert.match(html,/<html lang="en"/i,`Language missing: ${page}`);
 assert.match(html,/<title>[^<]+<\/title>/i,`Title missing: ${page}`);
 assert.match(html,/<h1\b[^>]*>/i,`H1 missing: ${page}`);
 assert.match(html,/<meta name="description"/i,`Description missing: ${page}`);
 assert.match(html,/href="(?:\.\.\/)?brand\.css"/,`Brand style missing: ${page}`);
 for(const match of html.matchAll(/(?:href|src)="([^"]+)"/g)){
  const target=match[1];
  if(/^(?:https?:|mailto:|tel:|data:|\/\/|#)/i.test(target))continue;
  const relative=decodeURIComponent(target.split(/[?#]/)[0]);
  if(!relative)continue;
  const dest=path.resolve(root,path.dirname(page),relative);
  assert.ok(dest===root||dest.startsWith(root+path.sep),`Escaping relative path in ${page}: ${target}`);
  assert.ok(fs.existsSync(dest),`Broken link or asset in ${page}: ${target}`);
 }
}
const home=fs.readFileSync(path.join(root,'index.html'),'utf8');
assert.match(home,/href="services\.html"/,'Homepage needs service catalogue navigation');
assert.match(home,/SAMPLE DATA/,'Dashboard sample label missing');
assert.match(home,/fictional scenarios/i,'Fictional evidence disclosure missing');
const doc=fs.readFileSync(path.join(root,'automated-document-processing.html'),'utf8');
assert.doesNotMatch(doc,/id="poc-upload-form"/,'Demo must not request real uploads');
assert.doesNotMatch(doc,/AES-256 Encrypted/,'Unsupported security claim must not return');
const js=fs.readFileSync(path.join(root,'ui-scripts.js'),'utf8');
assert.match(js,/safeName/,'Personalisation output escaping missing');
assert.match(js,/toastClose && toastEl/,'Service-page toast guard missing');
assert.ok(fs.existsSync(path.join(root,'sitemap.xml')),'Sitemap missing');
console.log(`PASS: ${pages.length} pages, metadata, file references and safe demo safeguards`);
