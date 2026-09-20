// MySpace 2008 - PWA Register Script
if ('serviceWorker' in navigator) {
  if (window.location.hostname === 'localhost' || window.location.hostname.includes('run.app')) {
    // Development / Preview environment: unregister any legacy workers to avoid collisions
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      for (var i = 0; i < registrations.length; i++) {
        registrations[i].unregister();
      }
    }).catch(function() {});
  }
}
