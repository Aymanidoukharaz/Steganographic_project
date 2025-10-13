/**
 * useCVDetection Hook - Synchronous Polling Version
 * Redesigned to work around iOS Safari async/await issues
 */

import { useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { DETECTION_STATUS } from '../utils/constants';
import { 
  startOpenCVLoad, 
  isOpenCVReady, 
  getOpenCVInstance,
  getLoadingStatus 
} from '../cv/opencv-loader-sync';

export function useCVDetection(videoRef) {
  const {
    state,
    setDetectionStatus,
    setCVInitialized,
    setCVLoading
  } = useApp();

  /**
   * Start OpenCV loading and polling
   */
  useEffect(() => {
    // Skip if no camera
    if (!state.cameraStream) {
      console.log('[useCVDetection Sync] No camera stream, waiting...');
      return;
    }

    // Skip if already initialized successfully
    if (state.cvInitialized) {
      console.log('[useCVDetection Sync] Already initialized successfully');
      return;
    }

    console.log('[useCVDetection Sync] ========== STARTING INITIALIZATION ==========');
    
    // Start loading OpenCV (non-blocking)
    setCVLoading(true);
    setDetectionStatus(DETECTION_STATUS.LOADING);
    startOpenCVLoad();

    // Start polling to check if ready
    let checkCount = 0;
    const pollingInterval = setInterval(() => {
      checkCount++;
      console.log(`[useCVDetection Sync] Polling check #${checkCount}...`);
      
      const status = getLoadingStatus();
      console.log(`[useCVDetection Sync] Status: ${status}`);

      if (status === 'error') {
        console.error('[useCVDetection Sync] ❌ OpenCV loading failed');
        clearInterval(pollingInterval);
        setCVLoading(false);
        setDetectionStatus(DETECTION_STATUS.ERROR);
        return;
      }

      if (isOpenCVReady()) {
        console.log('[useCVDetection Sync] ✅ OpenCV is ready!');
        const cv = getOpenCVInstance();
        
        if (cv && cv.Mat) {
          console.log('[useCVDetection Sync] ✅ Got valid OpenCV instance');
          console.log('[useCVDetection Sync] Setting cvInitialized = true...');
          
          clearInterval(pollingInterval);
          setCVInitialized(true);
          setCVLoading(false);
          setDetectionStatus(DETECTION_STATUS.SEARCHING);
          
          console.log('[useCVDetection Sync] ========== INITIALIZATION COMPLETE ==========');
        } else {
          console.error('[useCVDetection Sync] ❌ OpenCV instance invalid');
          clearInterval(pollingInterval);
          setCVLoading(false);
          setDetectionStatus(DETECTION_STATUS.ERROR);
        }
      }
    }, 200); // Check every 200ms

    // Cleanup
    return () => {
      console.log('[useCVDetection Sync] Cleaning up polling interval');
      clearInterval(pollingInterval);
    };
  }, [state.cameraStream, state.cvInitialized]); // FIXED: Removed state.cvLoading from dependencies

  return {
    isInitialized: state.cvInitialized,
    isLoading: state.cvLoading,
    detectionStatus: state.detectionStatus
  };
}

export default useCVDetection;
