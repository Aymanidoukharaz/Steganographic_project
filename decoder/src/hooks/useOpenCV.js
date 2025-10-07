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
  
  console.log('[useOpenCV] Hook called, opencvLoaded:', state.opencvLoaded, 'opencvLoading:', state.opencvLoading);
  
  useEffect(() => {
    console.log('[useOpenCV] useEffect running, opencvLoaded:', state.opencvLoaded, 'opencvLoading:', state.opencvLoading);
    
    // Skip if already loaded or currently loading
    if (state.opencvLoaded || state.opencvLoading) {
      console.log('[useOpenCV] Already loaded or loading, skipping');
      return;
    }
    
    console.log('[useOpenCV] ✅ Conditions met! Setting up 2-second delay timer...');
    
    // Delay OpenCV loading to prevent blocking initial render
    const loadTimer = setTimeout(async () => {
      console.log('[useOpenCV] ⏰ Timer fired! Initiating delayed OpenCV load (2s delay to prevent blocking)...');
      setOpenCVLoading(true);
      
      try {
        const cv = await loadOpenCV();
        const version = getOpenCVVersion();
        
        console.log(`[useOpenCV] ✅ OpenCV ready (${version})`);
        setOpenCVLoaded(version);
        
      } catch (error) {
        console.error('[useOpenCV] ❌ Failed to load OpenCV:', error);
        console.warn('[useOpenCV] App will continue without CV features');
        setOpenCVError(error.message);
      }
    }, 2000); // Wait 2 seconds after component mount
    
    return () => {
      console.log('[useOpenCV] Cleanup - clearing timer');
      clearTimeout(loadTimer);
    };
  }, [state.opencvLoaded, state.opencvLoading, setOpenCVLoading, setOpenCVLoaded, setOpenCVError]);
  
  return {
    loading: state.opencvLoading,
    loaded: state.opencvLoaded,
    error: state.opencvError,
    version: state.opencvVersion,
    cv: state.opencvLoaded ? getOpenCV() : null
  };
}
