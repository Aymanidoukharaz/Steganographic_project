import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { UI_TEXT, DETECTION_STATUS } from '../../utils/constants';

export function StatusIndicator() {
  const { state: { detectionStatus, detectionConfidence, processingFPS, opencvLoading, opencvLoaded, opencvError, opencvVersion } } = useApp();
  
  // If OpenCV is loading or failed, show that status instead
  if (opencvLoading) {
    return (
      <div className="fixed top-4 left-4 right-4 z-50">
        <div className="bg-blue-900/50 backdrop-blur-md rounded-lg px-4 py-3 border border-blue-600/50 shadow-lg animate-pulse-slow">
          <div className="flex items-center space-x-3">
            <div className="text-blue-400">
              <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-blue-400 text-sm font-medium">
                Chargement d'OpenCV...
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Initialisation du système de vision
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (opencvError) {
    return (
      <div className="fixed top-4 left-4 right-4 z-50">
        <div className="bg-red-900/50 backdrop-blur-md rounded-lg px-4 py-3 border border-red-600/50 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="text-red-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-red-400 text-sm font-medium">
                Erreur OpenCV
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {opencvError}
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
          text: UI_TEXT.status.idle,
          color: 'text-slate-400',
          bgColor: 'bg-slate-700',
          icon: 'search'
        };
      case DETECTION_STATUS.SEARCHING:
        return {
          text: UI_TEXT.status.searching,
          color: 'text-blue-400',
          bgColor: 'bg-blue-900/50',
          icon: 'search',
          animate: true
        };
      case DETECTION_STATUS.DETECTING:
        return {
          text: UI_TEXT.status.detecting,
          color: 'text-amber-400',
          bgColor: 'bg-amber-900/50',
          icon: 'target'
        };
      case DETECTION_STATUS.ACTIVE:
        return {
          text: UI_TEXT.status.active,
          color: 'text-emerald-400',
          bgColor: 'bg-emerald-900/50',
          icon: 'check'
        };
      default:
        return {
          text: UI_TEXT.status.idle,
          color: 'text-slate-400',
          bgColor: 'bg-slate-700',
          icon: 'search'
        };
    }
  };

  const renderIcon = (iconType) => {
    const baseClasses = "w-5 h-5";
    
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
      default:
        return null;
    }
  };

  const config = getStatusConfig();

  return (
    <div className="fixed top-4 left-4 right-4 z-50">
      <div className={`
        ${config.bgColor} backdrop-blur-md rounded-lg px-4 py-3 
        border border-slate-600/50 shadow-lg
        ${config.animate ? 'animate-pulse-slow' : ''}
      `}>
        <div className="flex items-center space-x-3">
          <div className={config.color}>
            {renderIcon(config.icon)}
          </div>
          
          <div className="flex-1">
            <p className={`${config.color} text-sm font-medium`}>
              {config.text}
            </p>
            
            {detectionStatus === DETECTION_STATUS.ACTIVE && detectionConfidence > 0 && (
              <p className="text-xs text-slate-400 mt-1">
                Confiance: {Math.round(detectionConfidence * 100)}%
              </p>
            )}
          </div>
          
          {processingFPS > 0 && (
            <div className="text-right">
              <p className="text-xs text-slate-400">
                {Math.round(processingFPS)} FPS
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}