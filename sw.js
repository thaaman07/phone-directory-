/* Urooj Library - offline support. Keep this file next to Index.html. */
const C='urooj-v1';
const EXT=['fonts.googleapis.com','fonts.gstatic.com','www.gstatic.com'];
self.addEventListener('install',e=>{self.skipWaiting();
 e.waitUntil(caches.open(C).then(c=>Promise.allSettled(['./','./Index.html'].map(u=>c.add(new Request(u,{cache:'reload'}))))))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
function timeout(ms){return new Promise((_,r)=>setTimeout(()=>r(new Error('timeout')),ms))}
self.addEventListener('fetch',e=>{
 const r=e.request;if(r.method!=='GET')return;
 const u=new URL(r.url);
 const same=u.origin===self.location.origin,ext=EXT.includes(u.hostname);
 if(!same&&!ext)return;
 e.respondWith((async()=>{
  const c=await caches.open(C);
  try{
   const res=await Promise.race([fetch(r),timeout(same?5000:8000)]);
   if(res&&(res.ok||res.type==='opaque'))c.put(r,res.clone()).catch(()=>{});
   return res;
  }catch(err){
   const hit=await c.match(r,{ignoreSearch:false})||(r.mode==='navigate'?(await c.match('./Index.html'))||(await c.match('./')):null);
   if(hit)return hit;
   return new Response('Offline',{status:503,statusText:'Offline'});
  }
 })())});
