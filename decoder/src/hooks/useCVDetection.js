/**
 * useCVDetection Hook
 * Manages computer vision detection integration with React
 */

import { useEffect, useRef, useCallback } from 'react';
import { useApp } from '../contexts/AppContext';
import { DETECTION_STATUS } from '../utils/constants';
import { 
  initializeCVPipeline, 
  processVideoFrame, 
  getCVStats,
  getCVPipeline 
} from '../cv/cv-pipeline';

export function useCVDetection(videoRef) {
  const {
    state,
    setDetectionStatus,
    setDetectionConfidence,
    setHomography,
    setCornerPositions,
    setCVInitialized,
    setCVLoading,
    setProcessingFPS
  } = useApp();

  const animationFrameRef = useRef(null);
  const isProcessingRef = useRef(false);
  const lastDetectionRef = useRef(null);

  /**
   * Initialize CV pipeline
   */
  const initializeCV = useCallback(async () => {
    if (state.cvInitialized) {
      return;
    }

    console.log('[useCVDetection] Initializing CV pipeline...');
    setCVLoading(true);
    setDetectionStatus(DETECTION_STATUS.LOADING);

    try {
      const result = await initializeCVPipeline();
      
      if (result.success) {
        setCVInitialized(true);
        setDetectionStatus(DETECTION_STATUS.SEARCHING);
        console.log('[useCVDetection] ✅ CV pipeline ready');
      } else {
        console.error('[useCVDetection] Initialization failed:', result.message);
        setDetectionStatus(DETECTION_STATUS.ERROR);
      }
    } catch (error) {
      console.error('[useCVDetection] Initialization error:', error);
      setDetectionStatus(DETECTION_STATUS.ERROR);
      setCVLoading(false);
    }
  }, [state.cvInitialized, setCVInitialized, setCVLoading, setDetectionStatus]);

  /**
   * Process frame for detection
   */
  const processFrame = useCallback(async () => {
    // Check if video is ready
    if (!videoRef?.current || videoRef.current.readyState < 2) {
      return;
    }

    // Check if CV is initialized
    if (!state.cvInitialized) {
      return;
    }

    // Prevent concurrent processing
    if (isProcessingRef.current) {
      return;
    }

    isProcessingRef.current = true;

    try {
      // Process video frame
      const result = await processVideoFrame(videoRef.current, {
        targetWidth: 480 // Downscale to 480p for performance
      });

      // Update status based on result
      if (result.skipped || result.busy) {
        // Frame was skipped for performance
        isProcessingRef.current = false;
        return;
      }

      if (result.error) {
        console.error('[useCVDetection] Processing error:', result.error);
        setDetectionStatus(DETECTION_STATUS.ERROR);
        isProcessingRef.current = false;
        return;
      }

      if (result.detected) {
        // Successful detection
        setDetectionStatus(DETECTION_STATUS.DETECTED);
        setDetectionConfidence(result.confidence);
        setHomography(result.homography);
        setCornerPositions(result.cornerPoints);
        
        lastDetectionRef.current = result;
      } else {
        // No detection
        if (state.detectionStatus === DETECTION_STATUS.DETECTED) {
          // Lost detection
          setDetectionStatus(DETECTION_STATUS.SEARCHING);
        }
        setDetectionConfidence(0);
        setHomography(null);
        setCornerPositions(null);
      }

      // Update performance metrics
      const stats = getCVStats();
      setProcessingFPS(stats.fps);

    } catch (error) {
      console.error('[useCVDetection] Frame processing error:', error);
    } finally {
      isProcessingRef.current = false;
    }
  }, [
    videoRef,
    state.cvInitialized,
    state.detectionStatus,
    setDetectionStatus,
    setDetectionConfidence,
    setHomography,
    setCornerPositions,
    setProcessingFPS
  ]);

  /**
   * Main processing loop
   */
  const processingLoop = useCallback(() => {
    processFrame();
    animationFrameRef.current = requestAnimationFrame(processingLoop);
  }, [processFrame]);

  /**
   * Start detection
   */
  const startDetection = useCallback(() => {
    if (!state.cvInitialized) {
      console.warn('[useCVDetection] CV not initialized, cannot start detection');
      return;
    }

    if (animationFrameRef.current) {
      console.warn('[useCVDetection] Detection already running');
      return;
    }

    console.log('[useCVDetection] Starting detection loop...');
    setDetectionStatus(DETECTION_STATUS.SEARCHING);
    processingLoop();
  }, [state.cvInitialized, setDetectionStatus, processingLoop]);

  /**
   * Stop detection
   */
  const stopDetection = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
      console.log('[useCVDetection] Detection loop stopped');
    }
  }, []);

  /**
   * Auto-initialize when camera is ready
   */
  useEffect(() => {
    if (state.cameraStream && !state.cvInitialized && !state.cvLoading) {
      initializeCV();
    }
  }, [state.cameraStream, state.cvInitialized, state.cvLoading, initializeCV]);

  /**
   * Auto-start detection when CV is initialized
   */
  useEffect(() => {
    if (state.cvInitialized && state.cameraStream) {
      startDetection();
    }

    return () => {
      stopDetection();
    };
  }, [state.cvInitialized, state.cameraStream, startDetection, stopDetection]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      stopDetection();
      const pipeline = getCVPipeline();
      pipeline.reset();
    };
  }, [stopDetection]);

  return {
    isInitialized: state.cvInitialized,
    isLoading: state.cvLoading,
    detectionStatus: state.detectionStatus,
    confidence: state.detectionConfidence,
    homography: state.homographyMatrix,
    cornerPositions: state.cornerPositions,
    lastDetection: lastDetectionRef.current,
    initializeCV,
    startDetection,
    stopDetection
  };
}

export default useCVDetection;
