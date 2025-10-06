import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { DETECTION_STATUS } from '../../utils/constants';

export function MinimalControls() {
  const { 
    state: { detectionStatus, showDebugInfo, processingFPS },
    setDetectionStatus,
    toggleDebugInfo
  } = useApp();

  // Simulate detection for Phase 2 testing
  const simulateDetection = () => {
    switch (detectionStatus) {
      case DETECTION_STATUS.IDLE:
      case DETECTION_STATUS.SEARCHING:
        setDetectionStatus(DETECTION_STATUS.DETECTING);
        setTimeout(() => setDetectionStatus(DETECTION_STATUS.ACTIVE), 2000);
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

  return (
    <>
      {/* Top Status Bar - Minimal */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-50">
        {/* Left: Status */}
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            detectionStatus === DETECTION_STATUS.ACTIVE ? 'bg-green-500' :
            detectionStatus === DETECTION_STATUS.DETECTING ? 'bg-yellow-500 animate-pulse' :
            detectionStatus === DETECTION_STATUS.SEARCHING ? 'bg-blue-500 animate-pulse' :
            'bg-gray-500'
          }`}></div>
          <span className="text-white text-sm font-medium bg-black/50 px-2 py-1 rounded-full backdrop-blur">
            {detectionStatus === DETECTION_STATUS.ACTIVE ? 'ACTIF' :
             detectionStatus === DETECTION_STATUS.DETECTING ? 'DÉTECTION...' :
             detectionStatus === DETECTION_STATUS.SEARCHING ? 'RECHERCHE...' :
             'PRÊT'}
          </span>
        </div>

        {/* Right: Debug Toggle */}
        <button
          onClick={toggleDebugInfo}
          className={`p-2 rounded-full backdrop-blur transition-colors ${
            showDebugInfo ? 'bg-blue-500/80 text-white' : 'bg-black/50 text-gray-300'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>

      {/* Center: Detection Frame */}
      {detectionStatus === DETECTION_STATUS.SEARCHING && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="border-2 border-dashed border-white/30 rounded-2xl w-80 h-60 flex items-center justify-center">
            <p className="text-white/80 text-center px-4 font-medium">
              Pointez vers un écran avec une vidéo encodée
            </p>
          </div>
        </div>
      )}

      {/* Bottom Controls - Minimal */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="flex items-center space-x-4">
          {/* Simulate Button - Phase 2 Only */}
          <button
            onClick={simulateDetection}
            className="bg-white/20 backdrop-blur text-white px-6 py-3 rounded-full font-medium transition-all hover:bg-white/30"
          >
            Test Détection
          </button>
        </div>
      </div>

      {/* Debug Info Overlay */}
      {showDebugInfo && (
        <div className="absolute top-16 left-4 bg-black/80 backdrop-blur text-white text-xs p-3 rounded-lg space-y-1 font-mono">
          <div>Status: {detectionStatus}</div>
          <div>FPS: {processingFPS}</div>
          <div>Phase: 2 (PWA Foundation)</div>
          <div className="text-yellow-400">Mode: Simulation</div>
        </div>
      )}
    </>
  );
}