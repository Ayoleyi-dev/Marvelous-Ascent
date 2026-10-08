// Three-step enquiry form with truthful, safe handoff.
// Backend submits ONLY if both a configured endpoint and public Turnstile site key exist.
// Without configuration this remains an explicitly described email draft, not fake persistence.
(() => {
 'use strict';
 const form=document.getElementById('project-brief-form');
 if(!form)return;
 const steps=[...form.querySelectorAll('.warm-intake-step')];
 const indicators=[...document.querySelectorAll('.warm-progress-dot')];
 const progress=document.getElementById('brief-progress');
 const stepLabel=document.getElementById('brief-step-label');
 const back=document.getElementById('brief-back');
 const next=document.getElementById('brief-next');
 const send=document.getElementById('brief-send');
 const status=document.getElementById('brief-error');
 const review=document.getElementById('brief-review');
 const consent=document.getElementById('brief-privacy');
 const modeText=document.getElementById('brief-delivery-mode');
 const deliveryNote=document.getElementById('brief-delivery-note');
 const captchaElement=document.getElementById('brief-turnstile');
 const captchaError=document.getElementById('brief-captcha-error');
 const raw=window.MA_LEAD_CONFIG||{};
 const backendReady=typeof raw.endpoint==='string'&&/^https:\/\//.test(raw.endpoint)&&
   typeof raw.turnstileSiteKey==='string'&&raw.turnstileSiteKey.length>=8;
 const titles=['A little about you','What you need help with','Review your details'];
 const entries=[['Name','name'],['Email','email'],['Business','company'],['Location','country'],
   ['Service area','service'],['What you need','challenge'],['Current tools','tools'],
   ['Timeline','timing'],['Budget indication','budget']];
 let active=0;
 let busy=false;
 let widgetId=null;
 let captchaLoaded=false;

 if(backendReady){
   send.textContent='Send project enquiry →';
   modeText.textContent='Your enquiry can be sent securely through our project form after you review it and complete the anti-spam check. You will see confirmation only after the server accepts it.';
   deliveryNote.textContent='After you press Send, we will validate and store your project enquiry and display a reference if successful. If there is a connection problem we will show an error, not claim it was submitted.';
   captchaElement.hidden=false;
   const script=document.createElement('script');
   script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
   script.async=true;
   script.defer=true;
   script.onload=()=>{
     try{
       widgetId=window.turnstile.render(captchaElement,{
        sitekey:raw.turnstileSiteKey,action:'project_brief',
        'error-callback':()=>{captchaError.textContent='Anti-spam check failed. Refresh the challenge and try again.';},
        'expired-callback':()=>{captchaError.textContent='Your anti-spam check expired. Please complete it again.';}
       });
       captchaLoaded=true;
     }catch{captchaError.textContent='Anti-spam verification is unavailable. Please use email instead.';}
   };
   script.onerror=()=>{captchaError.textContent='Anti-spam verification could not load. Please use email instead.';};
   document.head.appendChild(script);
 }else{
   send.textContent='Open email draft ↗';
   modeText.textContent='This form prepares a draft in your email app. We receive nothing until you press Send there.';
   deliveryNote.textContent='When you select Open email draft, your email app should open with your message. Review it and press Send there. This website does not store your details automatically.';
 }
 function showStep(index){
  active=index;steps.forEach((x,i)=>{x.hidden=i!==index;});
  indicators.forEach((x,i)=>x.classList.toggle('is-active',i<=index));
  progress.setAttribute('aria-valuenow',String(index+1));
  stepLabel.textContent='Step '+(index+1)+' of 3 · '+titles[index];
  back.hidden=index===0;next.hidden=index===2;send.hidden=index!==2;
  status.textContent='';
 }
 function verify(index,focus=true){
  for(const field of steps[index].querySelectorAll('input,select,textarea')){
    if(!field.checkValidity()){
      if(focus)field.reportValidity();
      status.textContent='Please check the highlighted field before continuing.';
      return false;
    }
  }
  return true;
 }
 function pairs(){
  const data=new FormData(form);
  return entries.map(([label,key])=>[label,String(data.get(key)||'').trim()||'Not provided']);
 }
 function renderReview(){
  review.replaceChildren();
  for(const [key,value] of pairs()){
    const row=document.createElement('div');
    const title=document.createElement('dt');title.textContent=key;
    const val=document.createElement('dd');val.textContent=value;
    row.append(title,val);review.appendChild(row);
  }
 }
 function reportError(message){status.textContent=message;send.disabled=false;busy=false;}
 back.addEventListener('click',()=>{if(!busy)showStep(Math.max(0,active-1));});
 next.addEventListener('click',()=>{
   if(busy||!verify(active))return;
   if(active===1)renderReview();
   showStep(Math.min(2,active+1));
   stepLabel.scrollIntoView({block:'center',behavior:'auto'});
 });
 form.addEventListener('submit',async event=>{
   event.preventDefault();
   if(busy)return;
   for(let i=0;i<2;i++)if(!verify(i,false)){showStep(i);verify(i,true);return;}
   if(!consent.checkValidity()){consent.reportValidity();status.textContent='Please read the privacy notice and confirm your choice.';return;}
   if(!backendReady){
     const lines=pairs().map(([k,v])=>k+': '+v);
     const company=String(new FormData(form).get('company')||'').trim().replace(/[\r\n]/g,' ');
     const body=['Hello Marvelous Ascent,','','Here is a little about my project:','',...lines,'','I would like to discuss a practical next step.','Thank you.'].join('\n');
     if(body.length>3500){status.textContent='Your brief is too long for an email link. Please shorten it or contact us directly.';return;}
     const subject='Project enquiry — '+(company||'new project');
     const url='mailto:meet.ayoleyi@gmail.com?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
     location.href=url;
     status.textContent='Your email app should open. You must press Send there to deliver your enquiry.';
     return;
   }
   if(!captchaLoaded||widgetId===null||!window.turnstile){
     captchaError.textContent='Anti-spam verification has not loaded. Please try again, or email us directly.';
     return;
   }
   const token=window.turnstile.getResponse(widgetId);
   if(!token){captchaError.textContent='Please complete the anti-spam verification first.';return;}
   captchaError.textContent='';
   busy=true;send.disabled=true;status.textContent='Sending your enquiry securely…';
   const formData=new FormData(form);
   const payload=Object.fromEntries(['name','email','company','country','service','challenge','tools','timing','budget']
     .map(key=>[key,String(formData.get(key)||'').trim()]));
   payload.privacyConsent=consent.checked;
   payload.turnstileToken=token;
   payload.website=String(formData.get('website')||'');
   const ctrl=new AbortController();
   const timeout=setTimeout(()=>ctrl.abort(),12000);
   try{
     const response=await fetch(raw.endpoint,{
       method:'POST',headers:{'content-type':'application/json'},
       body:JSON.stringify(payload),signal:ctrl.signal,credentials:'omit',mode:'cors'
     });
     const body=await response.json().catch(()=>({}));
     if(!response.ok||body.ok!==true)throw new Error('The server could not confirm your enquiry. Please retry or use direct email.');
     form.hidden=true;
     const confirmation=document.createElement('div');
     confirmation.className='warm-intake-note';
     confirmation.setAttribute('role','status');
     const heading=document.createElement('h2');heading.textContent='Your enquiry is in. Thank you!';
     const msg=document.createElement('p');msg.textContent='We have received your project brief and will review it. A response time is not guaranteed.';
     const ref=document.createElement('p');ref.textContent='Reference: '+String(body.id||'Unavailable');
     confirmation.append(heading,msg,ref);
     form.parentElement.appendChild(confirmation);
   }catch(error){
     reportError(error.name==='AbortError'?'The connection timed out. We cannot confirm delivery. Please try again or use direct email.':'We could not confirm delivery. Please try again or use direct email.');
     try{window.turnstile.reset(widgetId);}catch{}
   }finally{clearTimeout(timeout);busy=false;}
 });
 showStep(0);
})();
