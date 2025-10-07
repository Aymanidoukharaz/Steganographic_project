import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { FRENCH_TEXT, DETECTION_STATUS } from '../../utils/constants';

/**
 * StatusIndicator Component
 * Floating pill design with backdrop blur showing detection status
 */
export function StatusIndicator() {
  const { state: { detectionStatus, detectionConfidence, processingFPS, cvLoading, cvInitialized } } = useApp();
  
  // If OpenCV is loading, show loading status
  if (cvLoading) {
    return (
      <div className="fixed top-safe-top left-1/2 transform -translate-x-1/2 z-40 pointer-events-none mt-4">
        <div className="bg-surface/90 backdrop-blur-md rounded-full px-6 py-3 border border-primary/30 shadow-lg shadow-primary/20 animate-pulse-slow">
          <div className="flex items-center space-x-3">
            <div className="text-primary">
              <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-primary text-sm font-medium whitespace-nowrap">
                Chargement d'OpenCV...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // If detection status is ERROR, show warning
  if (detectionStatus === DETECTION_STATUS.ERROR) {
    return (
      <div className="fixed top-safe-top left-1/2 transform -translate-x-1/2 z-40 pointer-events-none mt-4">
        <div className="bg-surface/90 backdrop-blur-md rounded-full px-6 py-3 border border-error/30 shadow-lg shadow-error/20">
          <div className="flex items-center space-x-3">
            <div className="text-error">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-error text-sm font-medium whitespace-nowrap">
                Erreur de détection
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  const getStatusConfig = () => {
    switch (detectionStatus) {
      case DETECTION_STATUS.IDLE:
        return {
          text: FRENCH_TEXT.status.idle,
          color: 'text-text-secondary',
          bgColor: 'bg-surface/90',
          borderColor: 'border-surface-light',
          shadowColor: 'shadow-surface/20',
          icon: 'search',
          animate: false
        };
      case DETECTION_STATUS.SEARCHING:
        return {
          text: FRENCH_TEXT.status.searching,
          color: 'text-primary',
          bgColor: 'bg-surface/90',
          borderColor: 'border-primary/30',
          shadowColor: 'shadow-primary/20',
          icon: 'search',
          animate: true
        };
      case DETECTION_STATUS.DETECTING:
        return {
          text: FRENCH_TEXT.status.analyzing,
          color: 'text-warning',
          bgColor: 'bg-surface/90',
          borderColor: 'border-warning/30',
          shadowColor: 'shadow-warning/20',
          icon: 'target',
          animate: true
        };
      case DETECTION_STATUS.DETECTED:
        return {
          text: FRENCH_TEXT.status.detected,
          color: 'text-secondary',
          bgColor: 'bg-surface/90',
          borderColor: 'border-secondary/30',
          shadowColor: 'shadow-secondary/20',
          icon: 'check',
          animate: false
        };
      case DETECTION_STATUS.ACTIVE:
        return {
          text: FRENCH_TEXT.status.decoding,
          color: 'text-secondary',
          bgColor: 'bg-surface/90',
          borderColor: 'border-secondary/30',
          shadowColor: 'shadow-secondary/20',
          icon: 'play',
          animate: false
        };
      case DETECTION_STATUS.ERROR:
        return {
          text: FRENCH_TEXT.status.error,
          color: 'text-error',
          bgColor: 'bg-surface/90',
          borderColor: 'border-error/30',
          shadowColor: 'shadow-error/20',
          icon: 'error',
          animate: false
        };
      default:
        return {
          text: FRENCH_TEXT.status.idle,
          color: 'text-text-secondary',
          bgColor: 'bg-surface/90',
          borderColor: 'border-surface-light',
          shadowColor: 'shadow-surface/20',
          icon: 'search',
          animate: false
        };
    }
  };

  const renderIcon = (iconType, animate) => {
    const baseClasses = `w-5 h-5 ${animate ? 'animate-pulse-detection' : ''}`;
    
    switch (iconType) {
      case 'search':
        return (
          <svg className={baseClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        );
      case 'target':
        return (
          <svg className={baseClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'check':
        return (
          <svg className={baseClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'play':
        return (
          <svg className={baseClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'error':
        return (
          <svg className={baseClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const config = getStatusConfig();

  return (
    <div className="fixed top-safe-top left-1/2 transform -translate-x-1/2 z-40 pointer-events-none mt-4 px-4">
      <div 
        className={`${config.bgColor} backdrop-blur-md rounded-full px-6 py-3 border ${config.borderColor} shadow-lg ${config.shadowColor} ${config.animate ? 'animate-pulse-slow' : ''}`}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center space-x-3">
          <div className={config.color}>
            {renderIcon(config.icon, config.animate)}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`${config.color} text-sm font-medium whitespace-nowrap`}>
              {config.text}
            </p>
          </div>
          
          {/* Show confidence and FPS when actively detecting */}
          {(detectionStatus === DETECTION_STATUS.DETECTED || detectionStatus === DETECTION_STATUS.ACTIVE) && (
            <div className="flex items-center space-x-2 text-xs text-text-muted ml-2">
              {detectionConfidence > 0 && (
                <span className="flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  {Math.round(detectionConfidence * 100)}%
                </span>
              )}
              {processingFPS > 0 && (
                <span className="flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {Math.round(processingFPS)} FPS
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}