import React, { useEffect, useRef, useState } from 'react';
import { useCamera } from '../../hooks/useCamera';
import { useApp } from '../../contexts/AppContext';
import { useCVDetection } from '../../hooks/useCVDetection';
import { LoadingSpinner, ErrorMessage } from '../UI/LoadingSpinner';
import DetectionOverlay from '../UI/DetectionOverlay';
import { UI_TEXT, DETECTION_STATUS } from '../../utils/constants';

/**
 * CameraView Component
 * Displays live camera feed with status indicators and detection visualization
 * 
 * Features:
 * - Real-time camera feed display (60 FPS target)
 * - iOS Safari autoplay compatibility
 * - FPS monitoring and performance tracking
 * - Detection status visualization
 * - Error handling and retry logic
 * 
 * @component
 * @returns {React.ReactElement} Camera view with overlays
 */
export function CameraView() {
  const { 
    videoRef, 
    stream, 
    isLoading, 
    error, 
    hasPermission, 
    requestPermission, 
    startCamera 
  } = useCamera();
  
  const { 
    state: { detectionStatus, cvInitialized, cvLoading },
    setDetectionStatus,
    setProcessingFPS
  } = useApp();
  
  // Initialize CV detection with video ref
  const cvDetection = useCVDetection(videoRef);
  
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [videoError, setVideoError] = useState(null);
  const fpsCounterRef = useRef({ frames: 0, lastTime: 0 });
  const animationFrameRef = useRef();
  const lastStreamRef = useRef(null);
  const playAttemptedRef = useRef(false);

  /**
   * Handle video element ready state
   * Initializes detection status when camera feed is active
   */
  // Handle video element ready
  const handleVideoReady = () => {
    setIsVideoReady(true);
    setVideoError(null);
    
    // Start detection process
    if (detectionStatus === DETECTION_STATUS.IDLE) {
      setDetectionStatus(DETECTION_STATUS.SEARCHING);
    }
  };

  /**
   * Attach camera stream to video element
   * Handles iOS Safari autoplay requirements and stream lifecycle
   */
  useEffect(() => {
    if (stream && videoRef.current && stream !== lastStreamRef.current) {
      // Reset state for new stream
      playAttemptedRef.current = false;
      setIsVideoReady(false);
      setVideoError(null);
      
      videoRef.current.srcObject = stream;
      lastStreamRef.current = stream;
      
      // Set video attributes for iOS Safari compatibility
      videoRef.current.setAttribute('playsinline', 'true');
      videoRef.current.setAttribute('autoplay', 'true');
      videoRef.current.setAttribute('muted', 'true');
      
      // Attempt to play video with retry logic
      const playVideo = async () => {
        if (playAttemptedRef.current) return;
        playAttemptedRef.current = true;
        
        try {
          const playPromise = videoRef.current.play();
          if (playPromise !== undefined) {
            await playPromise;
          }
        } catch (error) {
          console.error('Video play error:', error.name);
          setVideoError(`Erreur de lecture: ${error.message}`);
          
          // Retry after brief delay
          setTimeout(async () => {
            try {
              await videoRef.current.play();
              setVideoError(null);
            } catch (retryError) {
              console.error('Video play retry failed:', retryError.name);
              setVideoError(`Impossible de démarrer la vidéo: ${retryError.message}`);
            }
          }, 500);
        }
      };
      
      setTimeout(playVideo, 100);
    }
  }, [stream, videoRef]);

  // FPS counter for camera feed
  const updateFPS = () => {
    const now = performance.now();
    fpsCounterRef.current.frames++;
    
    if (now - fpsCounterRef.current.lastTime >= 1000) {
      const fps = fpsCounterRef.current.frames;
      setProcessingFPS(fps);
      fpsCounterRef.current.frames = 0;
      fpsCounterRef.current.lastTime = now;
    }
    
    if (stream && isVideoReady) {
      animationFrameRef.current = requestAnimationFrame(updateFPS);
    }
  };

  // Start FPS monitoring when video is ready
  useEffect(() => {
    if (isVideoReady && stream) {
      fpsCounterRef.current.lastTime = performance.now();
      updateFPS();
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isVideoReady, stream]);

  // Handle app visibility change (returning from background)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && hasPermission === true && !stream) {
        console.log('App resumed - restarting camera');
        // Note: startCamera is called directly, not through state
        startCamera().catch(err => console.error('Failed to restart camera:', err));
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only set up once - the closure will capture the latest values

  // Handle permission request and camera start
  const handleRequestPermission = async () => {
    console.log('=== PERMISSION BUTTON CLICKED ===');
    console.log('User Agent:', navigator.userAgent);
    console.log('Is HTTPS?', window.location.protocol === 'https:');
    console.log('MediaDevices available?', !!navigator.mediaDevices);
    console.log('getUserMedia available?', !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia));
    
    try {
      // Request permission - this will trigger the browser permission dialog
      console.log('Calling requestPermission()...');
      const granted = await requestPermission();
      console.log('requestPermission() result:', granted);
      
      if (granted) {
        console.log('Permission granted successfully!');
      } else {
        console.log('Permission was not granted');
      }
    } catch (error) {
      console.error('Error in handleRequestPermission:', error);
    }
  };

  // Render permission request with prominent card design
  if (hasPermission === false || hasPermission === null) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-900 p-4">
        <div className="bg-slate-800 rounded-2xl p-8 max-w-sm w-full text-center space-y-6 shadow-2xl border border-slate-700">
          {/* Large Camera Icon */}
          <div className="w-24 h-24 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          
          {/* Title and Description */}
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-slate-50">
              Accès à la caméra requis
            </h2>
            <p className="text-slate-400 leading-relaxed">
              Cette application a besoin d'accéder à votre caméra pour détecter les vidéos encodées.
            </p>
          </div>
          
          {/* Prominent Action Button */}
          <button
            onClick={handleRequestPermission}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-700/50 text-white py-4 px-6 rounded-xl font-semibold text-lg transition-colors flex items-center justify-center gap-3 shadow-lg"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Autorisation...
              </>
            ) : (
              <>
                📷 Autoriser l'accès à la caméra
              </>
            )}
          </button>

          {/* Help Text */}
          <p className="text-xs text-slate-500 mt-4">
            Votre vie privée est protégée. Nous n'enregistrons rien.
          </p>
        </div>
      </div>
    );
  }

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-800">
        <LoadingSpinner size="xl" text={UI_TEXT.camera.loading} />
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-800">
        <ErrorMessage error={error} onRetry={startCamera} />
      </div>
    );
  }

  // Render fullscreen camera view
  return (
    <div className="absolute inset-0 bg-black">
      {/* Fullscreen Video Element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        controls={false}
        webkit-playsinline="true"
        className="w-full h-full object-cover"
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: 'scaleX(1)', // Prevent mirror effect
        }}
        onLoadedMetadata={(e) => {
          console.log('Video metadata loaded:', e.target.videoWidth, 'x', e.target.videoHeight);
          console.log('Video readyState:', e.target.readyState);
          handleVideoReady();
        }}
        onCanPlay={() => {
          console.log('Video can start playing');
        }}
        onPlaying={() => {
          console.log('Video started playing');
          setIsVideoReady(true);
        }}
        onError={(e) => {
          console.error('Video error:', e.target.error);
          if (e.target.error) {
            console.error('Video error code:', e.target.error.code);
            console.error('Video error message:', e.target.error.message);
          }
          setIsVideoReady(false);
        }}
        onLoadStart={() => {
          console.log('Video load started');
        }}
        onSuspend={() => {
          console.log('Video suspended');
        }}
        onStalled={() => {
          console.log('Video stalled');
        }}
      />
      
      {/* Phase 3: Detection Overlay Component */}
      <DetectionOverlay />
      
      {/* Loading Overlay for CV Initialization */}
      {cvLoading && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30">
          <div className="bg-black/80 backdrop-blur px-4 py-2 rounded-full text-white text-sm flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Chargement d'OpenCV...
          </div>
        </div>
      )}
      
      {/* Loading Overlay */}
      {!isVideoReady && stream && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-sm">Initialisation de la caméra...</p>
            {videoError && (
              <p className="text-red-400 text-xs mt-2 max-w-xs">{videoError}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}