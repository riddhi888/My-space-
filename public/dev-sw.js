// MySpace 2008 - Dev Service Worker Stub
self.addEventListener('install', function() {
  self.skipWaiting();
});
self.addEventListener('activate', function(event) {
  event.waitUntil(self.registration.unregister());
});
