import React, { useEffect, useRef, useState } from 'react';
import { useCamera } from '../../hooks/useCamera';
import { useApp } from '../../contexts/AppContext';
import { LoadingSpinner, ErrorMessage } from '../UI/LoadingSpinner';
import { UI_TEXT, DETECTION_STATUS } from '../../utils/constants';

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
    state: { detectionStatus },
    setDetectionStatus,
    setProcessingFPS
  } = useApp();
  
  const [isVideoReady, setIsVideoReady] = useState(false);
  const fpsCounterRef = useRef({ frames: 0, lastTime: 0 });
  const animationFrameRef = useRef();
  const lastStreamRef = useRef(null);

  // Handle video element ready
  const handleVideoReady = () => {
    setIsVideoReady(true);
    console.log('Camera video ready');
    
    // Start simulated detection process
    if (detectionStatus === DETECTION_STATUS.IDLE) {
      setDetectionStatus(DETECTION_STATUS.SEARCHING);
    }
  };

  // Attach stream to video element when stream changes
  useEffect(() => {
    if (stream && videoRef.current && stream !== lastStreamRef.current) {
      console.log('Attaching new stream to video element');
      videoRef.current.srcObject = stream;
      lastStreamRef.current = stream;
      
      // Try to play the video
      const playVideo = async () => {
        try {
          await videoRef.current.play();
          console.log('Video started playing successfully');
        } catch (error) {
          console.log('Video play failed, trying again in 100ms:', error);
          // Retry after a short delay
          setTimeout(async () => {
            try {
              await videoRef.current.play();
              console.log('Video started playing on retry');
            } catch (retryError) {
              console.error('Video play failed on retry:', retryError);
            }
          }, 100);
        }
      };
      
      playVideo();
    }
  }, [stream]);

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

  // Auto-start camera when permission granted or app resumes
  useEffect(() => {
    if (hasPermission === true && !stream && !isLoading) {
      console.log('Auto-starting camera - permission granted');
      startCamera();
    }
  }, [hasPermission, stream, isLoading, startCamera]);

  // Handle app visibility change (returning from background)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && hasPermission === true && !stream) {
        console.log('App resumed - restarting camera');
        startCamera();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [hasPermission, stream, startCamera]);

  // Handle permission request and camera start
  const handleRequestPermission = async () => {
    console.log('Permission button clicked - User Agent:', navigator.userAgent);
    console.log('Is HTTPS?', window.location.protocol === 'https:');
    console.log('MediaDevices available?', !!navigator.mediaDevices);
    
    try {
      // Request permission and immediately start camera
      const granted = await requestPermission();
      if (granted) {
        console.log('Permission granted, starting camera...');
        const stream = await startCamera();
        console.log('Camera stream:', stream);
      }
    } catch (error) {
      console.error('Failed to start camera:', error);
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
        className="w-full h-full object-cover"
        onLoadedMetadata={(e) => {
          console.log('Video metadata loaded:', e.target.videoWidth, 'x', e.target.videoHeight);
          handleVideoReady();
        }}
        onCanPlay={() => {
          console.log('Video can start playing');
        }}
        onPlaying={() => {
          console.log('Video started playing');
        }}
        onError={(e) => {
          console.error('Video error:', e.target.error);
          setIsVideoReady(false);
        }}
        onLoadStart={() => {
          console.log('Video load started');
        }}
      />
      
      {/* AR Overlay Canvas - Prepared for Phase 3 */}
      <canvas
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ mixBlendMode: 'normal' }}
      />
      
      {/* Corner Detection Indicators - Minimal Phase 3 Preview */}
      {detectionStatus === DETECTION_STATUS.DETECTING && (
        <div className="absolute inset-0 pointer-events-none">
          {[
            { position: 'top-8 left-8', border: 'border-l-2 border-t-2' },
            { position: 'top-8 right-8', border: 'border-r-2 border-t-2' },
            { position: 'bottom-8 left-8', border: 'border-l-2 border-b-2' },
            { position: 'bottom-8 right-8', border: 'border-r-2 border-b-2' }
          ].map((corner, i) => (
            <div 
              key={i}
              className={`absolute ${corner.position} w-6 h-6 ${corner.border} border-white animate-pulse`}
            />
          ))}
        </div>
      )}
      
      {/* Active Detection - Detected Screen */}
      {detectionStatus === DETECTION_STATUS.ACTIVE && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-12 border-2 border-green-500 rounded-xl shadow-lg shadow-green-500/25">
            {/* AR Subtitle Zone */}
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-green-500/10 border-t border-green-500/50 rounded-b-xl flex items-center justify-center">
              <span className="text-green-400 text-sm font-medium bg-black/50 px-3 py-1 rounded-full backdrop-blur">
                Zone AR Subtitles
              </span>
            </div>
          </div>
        </div>
      )}
      
      {/* Loading Overlay */}
      {!isVideoReady && stream && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-sm">Initialisation de la caméra...</p>
          </div>
        </div>
      )}
    </div>
  );
}