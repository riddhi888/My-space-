// MySpace 2008 Service Worker
self.addEventListener('install', function(event) {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    self.registration.unregister().then(function() {
      return self.clients.matchAll();
    })
  );
});

// Pass through all network requests directly
self.addEventListener('fetch', function() {
  // Direct network pass-through
});
