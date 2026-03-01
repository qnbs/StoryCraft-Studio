// Service Worker Registration für PWA
// Unterstützt GitHub Pages Subpath

const registerServiceWorker = async (): Promise<void> => {
  if (!('serviceWorker' in navigator)) {
    console.log('Service Workers not supported');
    return;
  }

  try {
    // Verwende BASE_URL für korrekte SW-Registrierung
    const basePath = import.meta.env.BASE_URL || '/';
    const swUrl = `${basePath}sw.js`;
    
    const registration = await navigator.serviceWorker.register(swUrl, {
      scope: basePath,
    });

    console.log('Service Worker registered:', registration.scope);

    // Update-Check
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // Neue Version verfügbar
            console.log('New version available! Refresh to update.');
          }
        });
      }
    });
  } catch (error) {
    console.error('Service Worker registration failed:', error);
  }
};

// Bei Window Load registrieren
if (typeof window !== 'undefined') {
  window.addEventListener('load', registerServiceWorker);
}

export { registerServiceWorker };
