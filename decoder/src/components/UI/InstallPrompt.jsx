import React, { useEffect } from 'react';

export function InstallPrompt() {
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      console.log('beforeinstallprompt event fired - allowing native browser install UI');
      // DO NOT preventDefault() - let browser show its native install banner/prompt
      // This allows Chrome/Edge on Android to show their native install UI
    };

    const handleAppInstalled = () => {
      console.log('PWA was installed successfully');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('App is running in standalone mode (already installed)');
    }

    // Detect iOS Safari (which doesn't support beforeinstallprompt)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
    
    if (isIOS && !isInStandaloneMode) {
      console.log('iOS Safari detected - Users can install via Share > Add to Home Screen');
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Return null - no custom UI, browser handles installation natively
  return null;
}