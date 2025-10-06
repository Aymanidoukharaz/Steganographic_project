/**
 * useOpenCV Hook
 * Manages OpenCV.js loading lifecycle and provides access to cv instance
 */

import { useEffect, useRef } from 'react';
import { useApp } from '../contexts/AppContext';
import { loadOpenCV, isOpenCVLoaded, getOpenCV, getOpenCVVersion } from '../cv/opencv/opencv-loader';

/**
 * Custom hook for OpenCV.js integration
 * Automatically loads OpenCV on mount and provides loading state
 * 
 * @returns {Object} OpenCV state and instance
 * @returns {boolean} loading - Whether OpenCV is currently loading
 * @returns {boolean} loaded - Whether OpenCV is loaded and ready
 * @returns {string|null} error - Error message if load failed
 * @returns {string|null} version - OpenCV version string
 * @returns {Object|null} cv - OpenCV.js instance (when loaded)
 */
export function useOpenCV() {
  const { state, setOpenCVLoading, setOpenCVLoaded, setOpenCVError } = useApp();
  const loadAttempted = useRef(false);
  
  useEffect(() => {
    // Only attempt to load once
    if (loadAttempted.current) {
      return;
    }
    
    // Skip if already loaded or loading
    if (state.opencvLoaded || state.opencvLoading) {
      return;
    }
    
    loadAttempted.current = true;
    
    async function initOpenCV() {
      console.log('[useOpenCV] Initiating OpenCV load...');
      setOpenCVLoading(true);
      
      try {
        const cv = await loadOpenCV();
        const version = getOpenCVVersion();
        
        console.log(`[useOpenCV] ✅ OpenCV ready (${version})`);
        setOpenCVLoaded(version);
        
      } catch (error) {
        console.error('[useOpenCV] ❌ Failed to load OpenCV:', error);
        setOpenCVError(error.message);
      }
    }
    
    initOpenCV();
  }, [state.opencvLoaded, state.opencvLoading, setOpenCVLoading, setOpenCVLoaded, setOpenCVError]);
  
  return {
    loading: state.opencvLoading,
    loaded: state.opencvLoaded,
    error: state.opencvError,
    version: state.opencvVersion,
    cv: state.opencvLoaded ? getOpenCV() : null
  };
}
