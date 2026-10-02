const CACHE='ps-piscina-v8-24-integrado';
const INTEGRACION='./cotizador-integracion-urgente.js?v=20261002c';
const ASSETS=['./','./index.html','./cotizador-integracion-urgente.js','./manifest.webmanifest','./icon.svg','./icon-192.png','./icon-512.png'];

self.addEventListener('install',e=>e.waitUntil(
  caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())
));

self.addEventListener('activate',e=>e.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
  await self.clients.claim();
  const clients=await self.clients.matchAll({type:'window',includeUncontrolled:true});
  for(const client of clients){
    try{ await client.navigate(client.url); }catch(_e){}
  }
})()));

function inyectar(html){
  if(html.includes('cotizador-integracion-urgente.js')) return html;
  return html.replace('</body>',`<script src="${INTEGRACION}"></script></body>`);
}

self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  if(e.request.mode==='navigate'){
    e.respondWith((async()=>{
      try{
        const resp=await fetch(e.request,{cache:'no-store'});
        const html=inyectar(await resp.clone().text());
        const out=new Response(html,{status:resp.status,statusText:resp.statusText,headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-cache, no-store, must-revalidate'}});
        const cache=await caches.open(CACHE);
        await cache.put('./index.html',out.clone());
        return out;
      }catch(_e){
        const cached=await caches.match('./index.html');
        if(!cached) return Response.error();
        return new Response(inyectar(await cached.text()),{headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-cache'}});
      }
    })());
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