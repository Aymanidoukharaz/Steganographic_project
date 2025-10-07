import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { useCamera } from '../../hooks/useCamera';
import { UI_TEXT, DETECTION_STATUS } from '../../utils/constants';

export function CameraControls() {
  const { 
    state: { detectionStatus, showDebugInfo, hasPermission, cameraLoading, cvInitialized },
    setDetectionStatus,
    toggleDebugInfo
  } = useApp();
  
  const { stopCamera, startCamera, requestPermission } = useCamera();

  // Simulate detection status changes for demo
  const simulateDetection = () => {
    switch (detectionStatus) {
      case DETECTION_STATUS.IDLE:
      case DETECTION_STATUS.SEARCHING:
        setDetectionStatus(DETECTION_STATUS.DETECTING);
        setTimeout(() => {
          setDetectionStatus(DETECTION_STATUS.ACTIVE);
        }, 2000);
        break;
      case DETECTION_STATUS.DETECTING:
        setDetectionStatus(DETECTION_STATUS.ACTIVE);
        break;
      case DETECTION_STATUS.ACTIVE:
        setDetectionStatus(DETECTION_STATUS.SEARCHING);
        break;
      default:
        setDetectionStatus(DETECTION_STATUS.SEARCHING);
    }
  };

  const resetDetection = () => {
    setDetectionStatus(DETECTION_STATUS.IDLE);
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      <div className="bg-slate-800/95 backdrop-blur-md rounded-lg px-4 py-3 border border-slate-600/50">
        <div className="flex items-center justify-between">
          {/* Primary controls */}
          <div className="flex items-center space-x-3">
            {hasPermission === null && (
              <button
                onClick={requestPermission}
                disabled={cameraLoading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-green-700/50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                {cameraLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Demande...
                  </>
                ) : (
                  <>
                    📷 Activer Caméra
                  </>
                )}
              </button>
            )}
            
            {hasPermission && (
              <>
                <button
                  onClick={simulateDetection}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  title="Simuler détection (Phase 2 seulement)"
                >
                  Simuler
                </button>
                
                <button
                  onClick={resetDetection}
                  className="bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Reset
                </button>
              </>
            )}
          </div>
          
          {/* Secondary controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleDebugInfo}
              className={`p-2 rounded-lg transition-colors ${
                showDebugInfo 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-400 hover:text-slate-300'
              }`}
              title="Afficher les informations de débogage"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </button>
            
            <button
              onClick={() => {
                // Toggle fullscreen if supported
                if (document.fullscreenElement) {
                  document.exitFullscreen();
                } else {
                  document.documentElement.requestFullscreen?.();
                }
              }}
              className="p-2 text-slate-400 hover:text-slate-300 transition-colors"
              title="Mode plein écran"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Debug info panel */}
        {showDebugInfo && (
          <div className="mt-3 pt-3 border-t border-slate-600 text-xs text-slate-400 space-y-1">
            <div className="grid grid-cols-2 gap-2">
              <div>Status: {detectionStatus}</div>
              <div>Phase: 3.1 (OpenCV Setup)</div>
              <div>Permission: {hasPermission === null ? 'Non demandée' : hasPermission ? 'Accordée' : 'Refusée'}</div>
              <div>Secure Context: {window.isSecureContext ? 'Oui' : 'Non'}</div>
              <div>Protocol: {window.location.protocol}</div>
              <div>PWA: {window.matchMedia('(display-mode: standalone)').matches ? 'Installée' : 'Non installée'}</div>
              <div className="col-span-2">OpenCV: {cvInitialized ? '✅ Prêt' : '⏳ Chargement...'}</div>
            </div>
            <div className="text-center text-slate-500 text-xs mt-2">
              ⚠️ Mode simulation - Computer Vision en Phase 3
            </div>
          </div>
        )}
      </div>
    </div>
  );
}