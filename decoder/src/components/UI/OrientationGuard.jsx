import React, { useState, useEffect } from 'react';

export function OrientationGuard({ children }) {
  const [isLandscape, setIsLandscape] = useState(false);
  const [showRotatePrompt, setShowRotatePrompt] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      // Detect if app is in standalone PWA mode
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                          window.navigator.standalone || 
                          document.referrer.includes('android-app://');
      
      let isCurrentlyLandscape = false;
      
      if (isStandalone && screen.orientation) {
        // In PWA mode, use screen.orientation API
        const angle = screen.orientation.angle;
        isCurrentlyLandscape = angle === 90 || angle === -90 || angle === 270;
        console.log('PWA mode - Screen orientation angle:', angle, 'Landscape:', isCurrentlyLandscape);
      } else if (typeof window.orientation !== 'undefined') {
        // Fallback to window.orientation for older browsers
        const angle = window.orientation;
        isCurrentlyLandscape = angle === 90 || angle === -90;
        console.log('Browser mode - Window orientation:', angle, 'Landscape:', isCurrentlyLandscape);
      } else {
        // Fallback to window dimensions
        isCurrentlyLandscape = window.innerWidth > window.innerHeight;
        console.log('Dimension fallback - Width:', window.innerWidth, 'Height:', window.innerHeight, 'Landscape:', isCurrentlyLandscape);
      }
      
      setIsLandscape(isCurrentlyLandscape);
      setShowRotatePrompt(!isCurrentlyLandscape);
    };

    // Check on mount
    checkOrientation();

    // Listen for orientation changes - use multiple events for better compatibility
    const events = ['resize', 'orientationchange'];
    events.forEach(event => {
      window.addEventListener(event, checkOrientation);
    });

    // Listen for screen orientation change in PWA mode
    if (screen.orientation) {
      screen.orientation.addEventListener('change', checkOrientation);
    }

    // Force landscape orientation if supported (optional, less aggressive)
    if (screen.orientation && screen.orientation.lock) {
      screen.orientation.lock('landscape-primary').catch(() => {
        console.log('Could not lock orientation - user will need to rotate manually');
      });
    }

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, checkOrientation);
      });
      if (screen.orientation) {
        screen.orientation.removeEventListener('change', checkOrientation);
      }
    };
  }, []);

  return (
    <div className="relative">
      {/* Render children (camera and UI) always */}
      {children}
      
      {/* Subtle orientation prompt overlay - only when needed */}
      {showRotatePrompt && (
        <div className="fixed top-4 left-4 right-4 z-50 flex justify-center">
          <div className="bg-slate-800/95 backdrop-blur-sm border border-slate-600 rounded-xl p-4 max-w-sm shadow-2xl">
            <div className="flex items-center space-x-4">
              {/* Compact Rotate Icon */}
              <div className="flex-shrink-0">
                <div className="relative w-10 h-6">
                  <div className="absolute inset-0 border border-slate-400 rounded-sm">
                    <div className="absolute top-0.5 left-1/2 transform -translate-x-1/2 w-3 h-0.5 bg-slate-400 rounded"></div>
                  </div>
                  {/* Rotation Arrow */}
                  <svg className="w-4 h-4 text-blue-400 absolute -right-5 top-1 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
              </div>
              
              {/* Compact Instructions */}
              <div className="flex-1">
                <p className="text-white text-sm font-medium">
                  Tournez en mode paysage
                </p>
                <p className="text-slate-400 text-xs">
                  Pour une expérience AR optimale
                </p>
              </div>

              {/* Dismiss Button */}
              <button
                onClick={() => setShowRotatePrompt(false)}
                className="flex-shrink-0 text-slate-500 hover:text-slate-300 text-xs px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}