const CACHE='ps-piscina-v8-20j';
const ASSETS=['./index.html?v=8.20j','./manifest.webmanifest?v=8.20j','./icon-192.png?v=8.20j','./icon-512.png?v=8.20j'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  e.respondWith(fetch(e.request).then(resp=>{
    const copy=resp.clone();
    caches.open(CACHE).then(c=>c.put(e.request,copy));
    return resp;
  }).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html?v=8.20j'))));
});
