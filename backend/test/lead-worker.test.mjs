import test from 'node:test';
import assert from 'node:assert/strict';
import {handleRequest} from '../lead-worker.mjs';

const origin='https://ayoleyi-dev.github.io';
const url='https://example-worker.workers.dev/enquiry';
function good(){return {
 name:'Example Client',email:'client@example.org',company:'Demo co',country:'Nigeria',
 service:'Data, dashboards and reporting',
 challenge:'Our weekly reports require too much manual consolidation.',
 tools:'Sheets',timing:'Within the next month',budget:'',
 privacyConsent:true,website:'',turnstileToken:'demo-token'
};}
function setup(){
 const writes=[];
 const env={
  ALLOWED_ORIGINS:origin,ALLOWED_HOSTNAMES:'ayoleyi-dev.github.io',
  TURNSTILE_SECRET:'test-secret',NOTIFY_FROM:'noreply@example.org',
  NOTIFY_TO:'team@example.org',RESEND_API_KEY:'test-resend',
  DB:{prepare(sql){return {bind(...args){return {async run(){writes.push({sql,args});return{success:true};}};}};}}
 };
 return {env,writes};
}
function mockFetcher({success=true,action='project_brief',hostname='ayoleyi-dev.github.io',mailStatus=200}={}){
 const calls=[];
 return {calls,fetcher:async (url,options)=>{
  calls.push({url:String(url),options});
  if(String(url).includes('siteverify'))return Response.json({success,action,hostname});
  return new Response('{}',{status:mailStatus});
 }};
}
function post(body,from=origin){
 return new Request(url,{method:'POST',headers:{'content-type':'application/json',Origin:from},body:JSON.stringify(body)});
}
test('stores a verified consented enquiry and notifies via email',async()=>{
 const {env,writes}=setup();const fake=mockFetcher();
 const res=await handleRequest(post(good()),env,{fetcher:fake.fetcher});
 const body=await res.json();
 assert.equal(res.status,201);assert.equal(body.ok,true);
 assert.match(body.id,/^[0-9a-f-]{36}$/i);
 assert.equal(writes.length,1);assert.equal(writes[0].args[1],'Example Client');
 assert.equal(fake.calls.length,2);assert.match(fake.calls[1].url,/api.resend.com/);
 assert.equal(res.headers.get('Access-Control-Allow-Origin'),origin);
});
test('rejected or missing Origin cannot write a lead',async()=>{
 const {env,writes}=setup();const fake=mockFetcher();
 const res=await handleRequest(post(good(),'https://not-us.example'),env,{fetcher:fake.fetcher});
 assert.equal(res.status,403);assert.equal(writes.length,0);assert.equal(fake.calls.length,0);
});
test('requires permission and valid fields',async()=>{
 const {env,writes}=setup();const fake=mockFetcher();
 for(const invalid of [{...good(),privacyConsent:false},{...good(),email:'invalid'},{...good(),service:'secret area'},{...good(),challenge:'tiny'}]){
  const res=await handleRequest(post(invalid),env,{fetcher:fake.fetcher});
  assert.equal(res.status,422);
 }
 assert.equal(writes.length,0);
});
test('rejects invalid CAPTCHA action or hostname',async()=>{
 const {env,writes}=setup();
 for(const fail of [{success:false},{action:'wrong'},{hostname:'phishing.example'}]){
  const fake=mockFetcher(fail);
  const res=await handleRequest(post(good()),env,{fetcher:fake.fetcher});
  assert.equal(res.status,403);
 }
 assert.equal(writes.length,0);
});
test('rejects if Worker secrets or D1 are not configured',async()=>{
 const {env,writes}=setup();delete env.RESEND_API_KEY;
 const res=await handleRequest(post(good()),env,{fetcher:mockFetcher().fetcher});
 assert.equal(res.status,503);assert.equal(writes.length,0);
});
test('database failure is not presented as success',async()=>{
 const {env}=setup();env.DB={prepare(){return{bind(){return{async run(){throw Error('simulated');}};}};}};
 const res=await handleRequest(post(good()),env,{fetcher:mockFetcher().fetcher});
 assert.equal(res.status,503);
});
test('a failed email notification does not discard an already stored lead',async()=>{
 const {env,writes}=setup();const fake=mockFetcher({mailStatus:503});
 const res=await handleRequest(post(good()),env,{fetcher:fake.fetcher});
 assert.equal(res.status,201);assert.equal(writes.length,1);
});
test('OPTIONS requests are permitted only from allowed origins',async()=>{
 const {env}=setup();
 const goodPreflight=await handleRequest(new Request(url,{method:'OPTIONS',headers:{Origin:origin}}),env);
 const badPreflight=await handleRequest(new Request(url,{method:'OPTIONS',headers:{Origin:'https://evil.example'}}),env);
 assert.equal(goodPreflight.status,204);assert.equal(badPreflight.status,403);
});
test('honeypot silently prevents storage and notifications',async()=>{
 const {env,writes}=setup();const fake=mockFetcher();
 const res=await handleRequest(post({...good(),website:'spam'}),env,{fetcher:fake.fetcher});
 assert.equal(res.status,202);assert.equal(writes.length,0);assert.equal(fake.calls.length,0);
});
