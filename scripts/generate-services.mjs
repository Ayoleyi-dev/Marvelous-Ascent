import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'data/services.json'), 'utf8'));
assert.ok(Array.isArray(data) && data.length === 7, 'Expected seven curated service families');
assert.equal(new Set(data.map(x => x.slug)).size, data.length, 'Slugs must be unique');
function esc(v){return String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");}

function siteShell({title,description,canonical,depth,body,active}){
  const p=depth?"../":"";
  const nav=[["Home",p+"index.html","home"],["Services",p+"services.html","services"],["Our Work",p+"work.html","work"],["Start a Project",p+"project-brief.html","contact"]];
  const navHtml=nav.map(([label,url,key])=>`<a href="${url}"${active===key?' aria-current="page"':''}>${label}</a>`).join("");
  return `<!doctype html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${esc(description)}">
  <title>${esc(title)} | Marvelous Ascent</title>
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${esc(title)} | Marvelous Ascent">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${canonical}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Fira+Code:wght@400;500&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${p}style.css">
  <link rel="stylesheet" href="${p}brand.css">
  <link rel="stylesheet" href="${p}services.css">
  <link rel="stylesheet" href="${p}welcome.css">
  <script src="${p}site-navigation.js" defer></script>
</head>
<body class="ma-services warm-story-page">
  <a class="ma-skip" href="#main">Skip to content</a>
  <header class="ma-header">
    <div class="ma-container ma-header-inner">
      <a class="ma-logo brand-lockup" href="${p}index.html" aria-label="Marvelous Ascent home"><span class="brand-lockup__mark" aria-hidden="true">[MA]</span><span class="brand-lockup__name">Marvelous Ascent</span></a>
      <nav class="ma-main-nav" aria-label="Primary navigation">${navHtml}</nav>
      <details class="ma-mobile-menu"><summary aria-label="Open page navigation"><span aria-hidden="true">☰</span> Menu</summary><nav class="ma-mobile-menu__links" aria-label="Mobile primary navigation">${navHtml}</nav></details>
      <button class="ma-theme" type="button" aria-label="Switch colour theme" aria-pressed="false">◐ <span>Theme</span></button>
    </div>
  </header>
  <main id="main">${body}</main>
  <footer class="ma-footer">
    <div class="ma-container ma-footer-content">
      <div><a class="ma-logo brand-lockup" href="${p}index.html"><span class="brand-lockup__mark" aria-hidden="true">[MA]</span><span class="brand-lockup__name">Marvelous Ascent</span></a><p>Data, automation and digital infrastructure built around real business needs.</p></div>
      <div class="ma-footer-links"><a href="${p}services.html">Explore services</a><a href="${p}work.html">View our work</a><a href="${p}project-brief.html">Get in touch</a></div>
    </div><div class="ma-container ma-copyright">© 2026 Marvelous Ascent · Client portal and account login are not yet available.</div>
  </footer>
</body>
</html>
`;
}

function renderHub(data){
 const cards=data.map((s,i)=>`<article class="ma-service-card">
   <span class="ma-card-number">${String(i+1).padStart(2,"0")}</span>
   <span class="ma-status">${esc(s.status)}</span>
   <h2><a href="services/${esc(s.slug)}.html">${esc(s.title)} <span aria-hidden="true">↗</span></a></h2>
   <p>${esc(s.summary)}</p>
   <p class="ma-audience">${esc(s.audience)}</p>
   <a class="ma-inline-link" href="services/${esc(s.slug)}.html">Explore deliverables and process →</a>
 </article>`).join("\n");
 return siteShell({title:"Our Services",description:"Explore Marvelous Ascent services across analytics, automation, web, commerce, SEO, campaigns and research. Read deliverables, approach and proof status before enquiring.",canonical:"https://ayoleyi-dev.github.io/Marvelous-Ascent/services.html",active:"services",depth:0,body:`
<section class="ma-hero"><div class="ma-container">
  <p class="ma-eyebrow">Marvelous Ascent / What we build</p>
  <h1>Business problems first.<br><span class="ma-accent">The right systems second.</span></h1>
  <p class="ma-lead">Tell us what is making the work harder than it needs to be. We'll listen, agree a sensible scope and help you take the next step with clarity — no invented performance promises.</p>
  <div class="ma-actions"><a class="ma-button" href="project-brief.html">Discuss a project <span aria-hidden="true">→</span></a><a class="ma-button ma-button--outline" href="work.html">See delivered work</a></div>
</div></section>
<section class="ma-section" aria-labelledby="catalogue-title"><div class="ma-container">
  <div class="ma-section-intro"><p class="ma-eyebrow">Service catalogue</p><h2 id="catalogue-title">Find your starting point.</h2><p>Available to scope means we can discuss a defined project; exploratory services require a pilot or feasibility check. Neither status guarantees an outcome.</p></div>
  <div class="ma-card-grid">${cards}</div>
</div></section>
<section class="ma-section ma-section--soft"><div class="ma-container ma-split">
 <div><p class="ma-eyebrow">How projects begin</p><h2>Clarity before complexity.</h2></div>
 <ol class="ma-numbered"><li><strong>Discovery</strong><p>Tell us the problem, current tools, timeline and constraints.</p></li><li><strong>Proposal</strong><p>We agree scope, responsibilities, deliverables and acceptance criteria.</p></li><li><strong>Delivery</strong><p>We build, test, hand over and measure what is actually observable.</p></li></ol>
 </div></section>
<section class="ma-cta"><div class="ma-container"><h2>Not sure which service you need?</h2><p>Describe the bottleneck. We'll help identify a manageable next step.</p><a class="ma-button" href="project-brief.html">Start with the problem →</a></div></section>`});
}

function renderService(s,data){
 const bullets=(items)=>items.map(x=>`<li>${esc(x)}</li>`).join("");
 const steps=s.steps.map(([name,description],i)=>`<li><span class="ma-step-index">${String(i+1).padStart(2,"0")}</span><div><strong>${esc(name)}</strong><p>${esc(description)}</p></div></li>`).join("");
 const faqs=s.faqs.map(([q,a])=>`<details class="ma-faq"><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("");
 const typeLink=s.evidence.href.startsWith("https://")?" target=\"_blank\" rel=\"noopener noreferrer\"":"";
 const related=data.filter(x=>x.slug!==s.slug).slice(0,3).map(x=>`<a href="${esc(x.slug)}.html">${esc(x.title)} <span aria-hidden="true">→</span></a>`).join("");
 return siteShell({title:s.title,description:s.summary,canonical:`https://ayoleyi-dev.github.io/Marvelous-Ascent/services/${s.slug}.html`,active:"services",depth:1,body:`
<section class="ma-hero"><div class="ma-container">
  <nav aria-label="Breadcrumb" class="ma-breadcrumb"><a href="../index.html">Home</a><span>/</span><a href="../services.html">Services</a><span>/</span><span aria-current="page">${esc(s.title)}</span></nav>
  <div class="ma-eyebrow">${esc(s.label)} <span class="ma-bullet" aria-hidden="true">•</span> <span class="ma-status">${esc(s.status)}</span></div>
  <h1>${esc(s.title)}</h1>
  <p class="ma-service-tagline">Less uncertainty. More room to focus on your work.</p>
  <p class="ma-lead">${esc(s.summary)}</p><p class="ma-for"><strong>Best fit:</strong> ${esc(s.audience)}</p>
  <div class="ma-actions"><a class="ma-button" href="../project-brief.html">Discuss this service →</a><a class="ma-button ma-button--outline" href="../services.html">All services</a></div>
</div></section>
<nav class="ma-page-jumps" aria-label="On this service page"><div class="ma-container ma-page-jumps__inner"><span class="ma-page-jumps__caption">Explore this service</span><a href="#problem">The challenge</a><a href="#deliverables">What we deliver</a><a href="#approach">Our approach</a><a href="#evidence">Our experience</a><a href="#questions">Questions</a></div></nav>
<section class="ma-section" id="problem"><div class="ma-container ma-split">
 <div><p class="ma-eyebrow">The problem</p><h2>Does this sound familiar?</h2><p>These are common symptoms, not claims about your business.</p></div>
 <ul class="ma-check-list">${bullets(s.symptoms)}</ul>
</div></section>
<section class="ma-section ma-section--soft" id="deliverables"><div class="ma-container">
  <p class="ma-eyebrow">What is included</p><h2>Clear deliverables, not buzzwords.</h2>
  <div class="ma-panel-grid"><div class="ma-panel"><h3>Typical scope</h3><ul class="ma-check-list">${bullets(s.includes)}</ul></div>
  <div class="ma-panel"><h3>Scope boundaries</h3><p>Technology choices, integration access, client responsibilities and required security controls are confirmed during discovery.</p><p class="ma-small"><strong>Tools considered:</strong> ${esc(s.tools)}</p><p class="ma-small"><strong>Timeline:</strong> Proposed after reviewing complexity, dependencies and access.</p><p class="ma-small"><strong>Pricing:</strong> Written project quote based on agreed scope.</p></div></div>
</div></section>
<section class="ma-section" id="approach"><div class="ma-container ma-split">
 <div><p class="ma-eyebrow">Working method</p><h2>From input to handover.</h2><p>We define what success means before building and check outputs against agreed acceptance criteria.</p></div>
 <ol class="ma-numbered">${steps}</ol>
</div></section>
<section class="ma-section ma-section--soft" id="evidence"><div class="ma-container">
 <p class="ma-eyebrow">Evidence and honesty</p><h2>Here is what we can point to.</h2>
 <div class="ma-evidence"><span class="ma-status">${esc(s.evidence.type)}</span><h3>${esc(s.evidence.title)}</h3><p>${esc(s.evidence.description)}</p><a class="ma-inline-link" href="${esc(s.evidence.href)}"${typeLink}>Explore this reference →</a></div>
</div></section>
<section class="ma-section" id="questions"><div class="ma-container ma-split">
 <div><p class="ma-eyebrow">Practical questions</p><h2>Before we begin.</h2></div>
 <div>${faqs}</div>
</div></section>
<section class="ma-section ma-section--soft"><div class="ma-container"><p class="ma-eyebrow">Also explore</p><div class="ma-related">${related}</div></div></section>
<section class="ma-cta"><div class="ma-container"><h2>Have a specific challenge?</h2><p>Tell us your current tools, what is not working and the outcome you need. We can discuss a realistic scope.</p><a class="ma-button" href="../project-brief.html">Start a project enquiry →</a></div></section>`});
}

function renderSitemap(data){
 const base="https://ayoleyi-dev.github.io/Marvelous-Ascent/";
 const pages=["","services.html","work.html","work/sonofiam.html","work/diams.html","project-brief.html","automated-lead-gen.html","custom-bi-dashboards.html","web-social-automation.html","automated-document-processing.html",...data.map(s=>"services/"+s.slug+".html")];
 return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map(x=>`  <url><loc>${base+x}</loc></url>`).join("\n")}\n</urlset>\n`;
}
const output = {'services.html':renderHub(data),'sitemap.xml':renderSitemap(data)};
for (const s of data) output[`services/${s.slug}.html`] = renderService(s,data);
const check = process.argv.includes('--check');
for (const [file,content] of Object.entries(output)) {
 const dest=path.join(root,file);
 if(check){assert.ok(fs.existsSync(dest), `Generated file missing: ${file}`); assert.equal(fs.readFileSync(dest, 'utf8'),content, `Generated file out of date: ${file}. Run node scripts/generate-services.mjs`);} 
 else {fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,content,'utf8');}
}
console.log(`${check?'Verified':'Generated'} ${Object.keys(output).length} static service pages/sitemap from data/services.json`);
