// Service worker mínimo: guarda sólo la "cáscara" (esta página, íconos y config).
// Los datos siempre vienen del motor por internet (no se guardan en el celular).
// Si cambias archivos de la cáscara, sube el número de versión.
var CACHE = 'capec-pagos-v3';
var ARCHIVOS = [
  './', './index.html', './config.js', './manifest.json',
  './icono-192.png', './icono-512.png', './apple-touch-icon.png', './logo-carga.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ARCHIVOS); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

// Primero internet (para que los cambios se vean luego luego); si no hay, lo guardado.
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(req).then(function (resp) {
      var copia = resp.clone();
      if (resp.ok) caches.open(CACHE).then(function (c) { c.put(req, copia); });
      return resp;
    }).catch(function () {
      return caches.match(req, { ignoreSearch: true });
    })
  );
});
