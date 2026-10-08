// Browser regression tests for all modern service-navigation layouts.
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {chromium} from 'playwright';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const screenshots=path.join(root,'artifacts','service-layout');
fs.mkdirSync(screenshots,{recursive:true});
const routes=['services.html','services/data-analytics.html','services/market-research.html','work.html','project-brief.html'];
const screenSizes=[{width:390,height:844,name:'phone'},{width:768,height:1024,name:'tablet'},{width:1440,height:900,name:'desktop'}];
const browser=await chromium.launch({headless:true});
try{
 for(const size of screenSizes){
  for(const theme of ['dark','light']){
   for(const route of routes){
    const page=await browser.newPage({viewport:{width:size.width,height:size.height}});
    await page.goto(pathToFileURL(path.join(root,route)).href,{waitUntil:'domcontentloaded'});
    await page.evaluate(async value=>{document.documentElement.setAttribute('data-theme',value);await document.fonts.ready;},theme);
    const st=await page.evaluate(()=>{
     const nav=document.querySelector('.ma-main-nav'),mobile=document.querySelector('.ma-mobile-menu');
     return {
      total:document.documentElement.scrollWidth, width:innerWidth,
      title:document.querySelector('main h1')?.getBoundingClientRect().right,
      mark:document.querySelector('.ma-header .brand-lockup__mark')?.textContent?.trim(),
      navVisible:nav?getComputedStyle(nav).display!=='none':false,
      menuVisible:mobile?getComputedStyle(mobile).display!=='none':false
     };
    });
    assert.equal(st.mark,'[MA]',route+' logo');
    assert.ok(st.total<=st.width+6,route+' '+size.name+' '+theme+' horizontal overflow '+JSON.stringify(st));
    assert.ok(st.title<=st.width+2,route+' '+size.name+' heading overflow');
    if(size.width<=800){
      assert.equal(st.navVisible,false,route+' mobile should hide desktop nav');
      assert.equal(st.menuVisible,true,route+' mobile menu should be shown');
      await page.locator('.ma-mobile-menu summary').click();
      assert.equal(await page.locator('.ma-mobile-menu').getAttribute('open'),'','Mobile menu should open');
      assert.equal(await page.locator('.ma-mobile-menu__links a').count(),4,'Expected four menu links');
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('.ma-mobile-menu').getAttribute('open'),null,'Escape should close menu');
    } else {
      assert.equal(st.navVisible,true,route+' desktop nav');
      assert.equal(st.menuVisible,false,route+' desktop menu hidden');
    }
    if(route==='services.html'){
      assert.equal(await page.locator('.ma-service-card').count(),7,'Seven service cards expected');
      assert.equal(await page.locator('.ma-hub-direction').count(),1,'Welcoming help prompt expected');
    }
    if(route==='services/data-analytics.html'){
      for(const id of ['problem','deliverables','approach','evidence','questions']){
       assert.equal(await page.locator('#'+id).count(),1,'Missing section '+id);
       assert.equal(await page.locator('.ma-page-jumps a[href="#'+id+'"]').count(),1,'Missing anchor '+id);
      }
    }
    if((route==='services.html'||route==='services/data-analytics.html')&&size.width!==768){
      const file=route.replace(/[/.]/g,'-')+'-'+size.name+'-'+theme+'.png';
      await page.screenshot({path:path.join(screenshots,file),fullPage:false});
    }
    console.log('PASS '+route+' '+size.name+' '+theme);
    await page.close();
   }
  }
 }
 console.log('PASS: service routes, page jumps, keyboard navigation, layouts and themes');
} finally {await browser.close();}
