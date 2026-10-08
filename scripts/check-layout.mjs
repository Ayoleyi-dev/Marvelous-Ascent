/**
 * Browser layout regression checks for the oversized homepage hero.
 * Uses Playwright on CI so DOM measurements, not just CSS strings, protect the layout.
 * Run after installing Playwright/Chromium: node scripts/check-layout.mjs
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDir=path.join(root,'artifacts','layout-check');
fs.mkdirSync(outputDir,{recursive:true});

const browser=await chromium.launch({headless:true});
const sizes=[
 {width:390,height:844,label:'mobile'},
 {width:768,height:960,label:'tablet'},
 {width:1440,height:900,label:'desktop'},
 {width:1650,height:920,label:'wide-desktop'}
];
try {
 for(const {width,height,label} of sizes){
   const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
   await page.goto(pathToFileURL(path.join(root,'index.html')).href,{waitUntil:'domcontentloaded'});
   await page.evaluate(async()=>{await document.fonts.ready;});
   const data=await page.evaluate(()=>{
     const rect=el=>{
       const b=el.getBoundingClientRect();
       return {top:b.top,bottom:b.bottom,left:b.left,right:b.right,width:b.width,height:b.height};
     };
     const h1=document.querySelector('.warm-headline');
     const card=document.querySelector('.warm-welcome-card');
     const text=document.querySelector('.warm-hero-copy');
     const hero=document.querySelector('.warm-hero');
     const logo=document.querySelector('.site-header .brand-lockup');
     return {
       viewport:window.innerWidth,
       documentWidth:document.documentElement.scrollWidth,
       title:rect(h1),titleFont:parseFloat(getComputedStyle(h1).fontSize),
       hero:rect(hero),copy:rect(text),card:rect(card),
       logo:logo?rect(logo):null,
       brandMark:logo?.querySelector('.brand-lockup__mark')?.textContent?.trim()
     };
   });
   assert.ok(data.logo && data.brandMark==='[MA]',label+' should show a recognizable MA logo');
   assert.ok(data.logo.right<=data.viewport+2,label+' logo escapes viewport');
   assert.ok(data.documentWidth<=data.viewport+6,label+' has horizontal overflow: '+JSON.stringify(data));
   assert.ok(data.title.right<=data.viewport+2,label+' headline overflows viewport');
   assert.ok(data.card.right<=data.viewport+2,label+' welcome card overflows viewport');
   if(width>=1100){
     assert.ok(data.titleFont<=46,label+' headline font is oversized: '+data.titleFont);
     assert.ok(data.title.height<=250,label+' headline wraps into too many lines: '+data.title.height);
     assert.ok(data.hero.height<=700,label+' hero too tall for desktop: '+data.hero.height);
     assert.ok(data.copy.right<=data.card.left+2,label+' copy and welcome card overlap');
   }
   await page.screenshot({path:path.join(outputDir,'home-'+label+'.png'),fullPage:false});
   console.log('PASS '+label+' '+data.viewport+'px title='+Math.round(data.title.height)+'px hero='+Math.round(data.hero.height)+'px font='+Math.round(data.titleFont)+'px');
   await page.close();
 }
 // Cross-page brand check at mobile width.
 for(const filename of ['services.html','work.html','project-brief.html','services/data-analytics.html']){
   const page=await browser.newPage({viewport:{width:390,height:844}});
   await page.goto(pathToFileURL(path.join(root,filename)).href,{waitUntil:'domcontentloaded'});
   const status=await page.evaluate(()=>{
     const logo=document.querySelector('.ma-header .brand-lockup');
     return {text:logo?.querySelector('.brand-lockup__name')?.textContent?.trim(),
       mark:logo?.querySelector('.brand-lockup__mark')?.textContent?.trim(),
       overflow:document.documentElement.scrollWidth-window.innerWidth,
       right:logo?.getBoundingClientRect().right, viewport:window.innerWidth};
   });
   assert.equal(status.mark,'[MA]',filename+' has a mismatched logo mark');
   assert.equal(status.text,'Marvelous Ascent',filename+' has a mismatched name');
   assert.ok(status.right<=status.viewport+2,filename+' logo overflows mobile');
   assert.ok(status.overflow<=6,filename+' page has horizontal overflow');
   await page.close();
 }
 console.log('PASS: responsive home and cross-page brand checks');
} finally {
 await browser.close();
}
