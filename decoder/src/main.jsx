import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { registerSW } from 'virtual:pwa-register'

// Unregister old service workers that might be causing issues
async function cleanupServiceWorkers() {
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      console.log(`[SW Cleanup] Found ${registrations.length} service worker(s)`);
      
      // Don't unregister all - just log for debugging
      for (const registration of registrations) {
        console.log('[SW Cleanup] Active SW scope:', registration.scope);
      }
    } catch (error) {
      console.warn('[SW Cleanup] Could not check service workers:', error);
    }
  }
}

// Run cleanup
cleanupServiceWorkers();

// Register service worker for PWA functionality with error handling
try {
  const updateSW = registerSW({
    onNeedRefresh() {
      console.log('[PWA] New content available, please refresh.');
    },
    onOfflineReady() {
      console.log('[PWA] App ready to work offline.');
    },
    onRegisterError(error) {
      console.error('[PWA] Service worker registration failed:', error);
    },
    immediate: true
  });
} catch (error) {
  console.warn('[PWA] Could not register service worker:', error);
  // App will still work without service worker
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)