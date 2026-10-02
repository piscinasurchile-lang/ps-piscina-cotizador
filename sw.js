const CACHE='ps-piscina-v8-23-integrado';
const ASSETS=['./','./index.html','./cotizador-integracion-urgente.js','./manifest.webmanifest','./icon.svg','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET') return;
 if(e.request.mode==='navigate'){
  e.respondWith(fetch(e.request,{cache:'no-store'}).then(async resp=>{
   const txt=await resp.clone().text();
   const injected=txt.includes('cotizador-integracion-urgente.js')?txt:txt.replace('</body>','<script src="./cotizador-integracion-urgente.js?v=20261002b"></script></body>');
   const out=new Response(injected,{status:resp.status,statusText:resp.statusText,headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-cache, no-store, must-revalidate'}});
   caches.open(CACHE).then(c=>c.put('./index.html',out.clone()));
   return out;
  }).catch(async()=>{
   const r=await caches.match('./index.html');
   if(!r) return Response.error();
   const txt=await r.text();
   const injected=txt.includes('cotizador-integracion-urgente.js')?txt:txt.replace('</body>','<script src="./cotizador-integracion-urgente.js?v=20261002b"></script></body>');
   return new Response(injected,{headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-cache'}});
  }));
  return;
 }
 e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(resp=>{
   if(resp.ok||resp.type==='opaque'){
     const copy=resp.clone();
     caches.open(CACHE).then(c=>c.put(e.request,copy));
   }
   return resp;
 })));
});