/* Service worker simples: guarda os arquivos do jogo para abrir offline.
   Estratégia "rede primeiro": sempre tenta a versão nova e só usa o cache se estiver sem internet. */
const CACHE = 'solo-fitness-v33-18-beta';
const ARQUIVOS = ['./', './index.html', './style.css', './js/script.js', './js/sombras.js', './js/avatares.js', './js/cenas.js', './json/manifest.json', './icon.svg'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
    if (e.request.method !== 'GET') return;
    e.respondWith(fetch(e.request).then(r => { if (r && (r.ok || r.type === 'opaque')) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)).catch(() => {}); } return r; }).catch(() => caches.match(e.request)));
});