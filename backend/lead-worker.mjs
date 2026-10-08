// Cloudflare Worker module: secure, explicitly configured project-enquiry ingestion.
// No account credentials or deployment IDs should ever be committed to this repository.
const allowedServices=new Set([
 'Not sure yet — help me figure it out',
 'Data, dashboards and reporting',
 'Automation and smoother operations',
 'Website and digital presence',
 'Commerce and conversion',
 'SEO and discoverability',
 'Campaign measurement and advertising',
 'Market research and surveys'
]);
const allowedTimes=new Set([
 'As soon as practical','Within the next month','In 1–3 months','Just exploring for now'
]);
const allowedBudgets=new Set([
 '',"I'd rather discuss this",'Under ₦100,000','₦100,000–₦300,000',
 '₦300,000–₦750,000','Above ₦750,000','International / different currency'
]);
const readText=(value,max)=>typeof value==='string'?value.trim().slice(0,max+1):'';
function respond(body,status=200,origin='',extra={}) {
  const headers={'content-type':'application/json; charset=utf-8','cache-control':'no-store',...extra};
  if(origin){headers['access-control-allow-origin']=origin;headers.vary='Origin';}
  return new Response(JSON.stringify(body),{status,headers});
}
function invalid(message,origin){return respond({ok:false,error:message},422,origin);}
const allowlist=env=>(env.ALLOWED_ORIGINS||'').split(',').map(x=>x.trim()).filter(Boolean);
function matchesOrigin(origin,env) {
  if(!origin||!allowlist(env).includes(origin))return false;
  try{const u=new URL(origin);return u.protocol==='https:'||u.hostname==='localhost';}catch{return false;}
}
export async function handleRequest(request,env,deps={}) {
  const fetcher=deps.fetcher||fetch;
  const path=new URL(request.url).pathname;
  if(request.method==='GET'&&path==='/health')return respond({ok:true,service:'lead-intake'});
  if(path!=='/enquiry')return respond({ok:false,error:'Not found'},404);
  const origin=request.headers.get('Origin')||'';
  if(!matchesOrigin(origin,env))return respond({ok:false,error:'Origin not permitted'},403);
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{
    'access-control-allow-origin':origin,'access-control-allow-methods':'POST, OPTIONS',
    'access-control-allow-headers':'content-type','access-control-max-age':'600',vary:'Origin'
  }});
  if(request.method!=='POST')return respond({ok:false,error:'Method not allowed'},405,origin);
  if(!env.DB||!env.TURNSTILE_SECRET||!env.NOTIFY_TO||!env.NOTIFY_FROM||!env.RESEND_API_KEY){
    return respond({ok:false,error:'Enquiry service not configured'},503,origin);
  }
  if(!(request.headers.get('content-type')||'').toLowerCase().startsWith('application/json')){
    return respond({ok:false,error:'Expected JSON'},415,origin);
  }
  if(Number(request.headers.get('content-length')||0)>6000)return respond({ok:false,error:'Request too large'},413,origin);
  const raw=await request.text();
  if(raw.length>6000)return respond({ok:false,error:'Request too large'},413,origin);
  let data;try{data=JSON.parse(raw)}catch{return respond({ok:false,error:'Invalid JSON'},400,origin);}
  if(!data||typeof data!=='object'||Array.isArray(data))return invalid('Invalid enquiry',origin);
  // Honeypot rejects automated spam without storing or notifying.
  if(data.website)return respond({ok:true,message:'Thank you'},202,origin);
  const contact={
    name:readText(data.name,80),email:readText(data.email,150),
    company:readText(data.company,120),country:readText(data.country,90),
    service:readText(data.service,100),challenge:readText(data.challenge,1200),
    tools:readText(data.tools,300),timing:readText(data.timing,80),
    budget:readText(data.budget,80)
  };
  if(!contact.name||contact.name.length>80)return invalid('Name is required',origin);
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)||contact.email.length>150)return invalid('Valid email required',origin);
  if(!allowedServices.has(contact.service)||!allowedTimes.has(contact.timing)||!allowedBudgets.has(contact.budget))return invalid('Invalid selection',origin);
  if(contact.challenge.length<15||contact.challenge.length>1200||contact.tools.length>300||contact.company.length>120||contact.country.length>90)return invalid('Please check the enquiry details',origin);
  if(data.privacyConsent!==true)return invalid('Consent is required to process your enquiry',origin);
  const token=readText(data.turnstileToken,2048);
  if(!token)return invalid('Please complete the anti-spam check',origin);
  let verified=false;
  try{
    const body=new URLSearchParams({secret:env.TURNSTILE_SECRET,response:token});
    const ip=request.headers.get('CF-Connecting-IP');
    if(ip)body.set('remoteip',ip);
    const response=await fetcher('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body,signal:AbortSignal.timeout(8000)});
    if(!response.ok)throw new Error('Verification unreachable');
    const check=await response.json();
    const hostname=String(check.hostname||'');
    const hostnames=(env.ALLOWED_HOSTNAMES||'').split(',').map(s=>s.trim()).filter(Boolean);
    verified=check.success===true&&check.action==='project_brief'&&hostnames.includes(hostname);
  }catch{verified=false;}
  if(!verified)return respond({ok:false,error:'Anti-spam verification failed. Please try again.'},403,origin);
  const id=crypto.randomUUID();
  try {
    await env.DB.prepare(`INSERT INTO leads
      (id,name,email,company,country,service,challenge,tools,timing,budget,privacy_consent,source,status,created_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,1,?,'new',datetime('now'))`)
      .bind(id,contact.name,contact.email,contact.company,contact.country,contact.service,contact.challenge,contact.tools,contact.timing,contact.budget,'website_project_brief').run();
  } catch {
    return respond({ok:false,error:'Could not save your enquiry. Please email us instead.'},503,origin);
  }
  // Save first so an email provider outage does not lose the lead.
  try {
    const summary=[
      'New Marvelous Ascent project enquiry',`Reference: ${id}`,
      ...Object.entries(contact).map(([k,v])=>`${k}: ${v||'Not provided'}`)
    ].join('\n');
    const mail=await fetcher('https://api.resend.com/emails',{
      method:'POST',headers:{authorization:`Bearer ${env.RESEND_API_KEY}`,'content-type':'application/json'},
      body:JSON.stringify({from:env.NOTIFY_FROM,to:[env.NOTIFY_TO],subject:'New agency project enquiry',text:summary,reply_to:contact.email}),
      signal:AbortSignal.timeout(8000)
    });
    if(!mail.ok)console.error('Lead notification failed; stored record remains available');
  }catch{console.error('Lead notification unavailable; stored record remains available');}
  return respond({ok:true,id,message:'Your enquiry was received. We will review it and get back to you.'},201,origin);
}
async function purge(env){
 if(!env.DB)throw Error('DB binding required');
 // Do not retain unconverted enquiry records indefinitely.
 await env.DB.prepare("DELETE FROM leads WHERE created_at < datetime('now', '-90 days') AND status = 'new'").run();
}
export default {
 fetch(request,env){return handleRequest(request,env);},
 scheduled(_event,env,ctx){ctx.waitUntil(purge(env));}
};
