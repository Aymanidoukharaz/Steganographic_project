/**
 * useCVDetection Hook - Synchronous Polling Version
 * Redesigned to work around iOS Safari async/await issues
 */

import { useEffect, useRef } from 'react';
import { useApp } from '../contexts/AppContext';
import { DETECTION_STATUS } from '../utils/constants';
import { 
  startOpenCVLoad, 
  isOpenCVReady, 
  getOpenCVInstance,
  getLoadingStatus 
} from '../cv/opencv-loader-sync';
import { getCVPipeline } from '../cv/cv-pipeline';

export function useCVDetection(videoRef) {
  const {
    state,
    setDetectionStatus,
    setCVInitialized,
    setCVLoading,
    setCornerPositions,
    setHomography,
    setDetectionConfidence
  } = useApp();
  
  const detectionLoopRef = useRef(null);

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
  
  /**
   * Start detection loop once OpenCV is initialized
   */
  useEffect(() => {
    // Only start detection if OpenCV is initialized and we have video
    if (!state.cvInitialized || !videoRef.current) {
      console.log('[useCVDetection Sync] Waiting for init... cvInit:', state.cvInitialized, 'video:', !!videoRef.current);
      return;
    }
    
    console.log('[useCVDetection Sync] 🎬 Starting detection loop...');
    
    // Get singleton pipeline instance
    const pipeline = getCVPipeline();
    
    let isLoopActive = false;
    let isPipelineReady = false;
    
    // Initialize pipeline FIRST, then start detection
    console.log('[useCVDetection Sync] Calling pipeline.initialize()...');
    pipeline.initialize()
      .then(result => {
        console.log('[useCVDetection Sync] Initialize result:', result);
        
        if (result.success) {
          console.log('[useCVDetection Sync] ✅ CV Pipeline initialized, starting frame processing...');
          isLoopActive = true;
          isPipelineReady = true;
          
          // Detection loop - runs at ~15 FPS
          let frameCount = 0;
          const runDetection = async () => {
            if (!videoRef.current || !isLoopActive || !isPipelineReady) {
              return;
            }
            
            frameCount++;
            
            try {
              // Process frame
              const result = await pipeline.processFrame(videoRef.current);
              
              // Log every 30 frames (~2 seconds at 15 FPS)
              if (frameCount % 30 === 0) {
                console.log(`[useCVDetection Sync] Frame ${frameCount}: ${result.detected ? 'DETECTED ✅' : 'searching...'}`);
              }
              
              // Update state if corners detected
              if (result.detected) {
                console.log('[useCVDetection Sync] 🎯 CORNERS DETECTED!', result);
                setCornerPositions(result.corners);
                setHomography(result.homography);
                setDetectionConfidence(result.confidence);
                setDetectionStatus(DETECTION_STATUS.DETECTING);
              } else if (result.error && !result.skipped && !result.busy) {
                // Only log real errors, not skip/busy states
                if (frameCount % 100 === 0) {
                  console.error('[useCVDetection Sync] Detection error:', result.error);
                }
              }
            } catch (error) {
              console.error('[useCVDetection Sync] Frame processing exception:', error);
            }
          
            // Schedule next frame
            if (isLoopActive && isPipelineReady) {
              detectionLoopRef.current = requestAnimationFrame(runDetection);
            }
          };
          
          // Start the loop AFTER pipeline is initialized
          console.log('[useCVDetection Sync] 🚀 Launching detection loop now!');
          detectionLoopRef.current = requestAnimationFrame(runDetection);
          
        } else {
          console.error('[useCVDetection Sync] ❌ CV Pipeline init failed:', result.message);
        }
      })
      .catch(error => {
        console.error('[useCVDetection Sync] ❌ Pipeline init exception:', error);
      });
    
    // Cleanup
    return () => {
      console.log('[useCVDetection Sync] 🛑 Stopping detection loop');
      isLoopActive = false;
      isPipelineReady = false;
      if (detectionLoopRef.current) {
        cancelAnimationFrame(detectionLoopRef.current);
        detectionLoopRef.current = null;
      }
    };
  }, [state.cvInitialized, videoRef]);

  return {
    isInitialized: state.cvInitialized,
    isLoading: state.cvLoading,
    detectionStatus: state.detectionStatus
  };
}

export default useCVDetection;
