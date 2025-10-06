import { useEffect, useRef, useCallback } from 'react';
import { useApp } from '../contexts/AppContext';
import { CAMERA_CONSTRAINTS } from '../utils/constants';

export function useCamera() {
  const { 
    state: { cameraStream, cameraLoading, cameraError, hasPermission },
    setCameraStream,
    setCameraLoading,
    setCameraError,
    setPermission
  } = useApp();
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  
  const requestPermission = useCallback(async () => {
    try {
      setCameraLoading(true);
      setCameraError(null);
      console.log('Requesting camera permission...');
      
      // Check if we're in a secure context (required for camera access)
      if (!window.isSecureContext) {
        throw new Error('Camera access requires HTTPS connection');
      }
      
      // Check if mediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported');
      }
      
      // Try mobile-first, then fallback to any camera
      let constraints = {
        video: { 
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 }
        },
        audio: false
      };
      
      let testStream;
      try {
        testStream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (error) {
        console.log('Rear camera not available, trying any camera...');
        // Fallback to any available camera
        constraints = {
          video: { 
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        };
        testStream = await navigator.mediaDevices.getUserMedia(constraints);
      }
      
      console.log('Camera permission granted');
      console.log('Test stream tracks:', testStream.getTracks());
      
      // Use the test stream as the actual stream
      streamRef.current = testStream;
      setCameraStream(testStream);
      
      // Attach to video element immediately and start playback
      if (videoRef.current) {
        videoRef.current.srcObject = testStream;
        console.log('Video element srcObject set:', videoRef.current.srcObject);
        try {
          await videoRef.current.play();
          console.log('Video playback started successfully');
        } catch (playError) {
          console.log('Video autoplay blocked, will try on user interaction:', playError);
        }
      }
      
      setPermission(true);
      setCameraLoading(false);
      return true;
      
    } catch (error) {
      console.error('Camera permission error:', error);
      setPermission(false);
      setCameraLoading(false);
      
      let errorMessage = 'Impossible d\'accéder à la caméra';
      if (error.message.includes('HTTPS')) {
        errorMessage = 'Connexion HTTPS requise pour accéder à la caméra. Utilisez https:// dans l\'URL.';
      } else if (error.name === 'NotAllowedError') {
        errorMessage = 'Accès à la caméra refusé. Veuillez autoriser l\'accès dans les paramètres du navigateur.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'Aucune caméra trouvée sur cet appareil.';
      } else if (error.name === 'NotSupportedError') {
        errorMessage = 'Caméra non supportée par ce navigateur.';
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Caméra déjà utilisée par une autre application.';
      }
      
      setCameraError(errorMessage);
      return false;
    }
  }, [setCameraLoading, setCameraError, setPermission]);
  
  const startCamera = useCallback(async () => {
    if (streamRef.current) {
      console.log('Camera already started');
      return streamRef.current;
    }
    
    try {
      setCameraLoading(true);
      setCameraError(null);
      
      console.log('Starting camera with constraints:', CAMERA_CONSTRAINTS);
      
      const stream = await navigator.mediaDevices.getUserMedia(CAMERA_CONSTRAINTS);
      
      streamRef.current = stream;
      setCameraStream(stream);
      setCameraLoading(false);
      
      // Attach to video element if available and start playback
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
          console.log('Video playback started successfully');
        } catch (playError) {
          console.log('Video autoplay blocked, will try on user interaction:', playError);
        }
      }
      
      console.log('Camera started successfully');
      return stream;
      
    } catch (error) {
      console.error('Failed to start camera:', error);
      setCameraLoading(false);
      
      let errorMessage = 'Impossible de démarrer la caméra';
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Accès à la caméra refusé. Veuillez autoriser l\'accès.';
        setPermission(false);
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'Aucune caméra arrière trouvée. Vérifiez votre appareil.';
      } else if (error.name === 'OverconstrainedError') {
        errorMessage = 'Résolution de caméra non supportée. Tentative avec des paramètres réduits.';
        
        // Try with fallback constraints
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' },
            audio: false
          });
          
          streamRef.current = fallbackStream;
          setCameraStream(fallbackStream);
          
          if (videoRef.current) {
            videoRef.current.srcObject = fallbackStream;
            try {
              await videoRef.current.play();
              console.log('Fallback video playback started successfully');
            } catch (playError) {
              console.log('Fallback video autoplay blocked:', playError);
            }
          }
          
          return fallbackStream;
          
        } catch (fallbackError) {
          console.error('Fallback camera start failed:', fallbackError);
          setCameraError('Impossible de démarrer la caméra avec des paramètres réduits.');
        }
      }
      
      setCameraError(errorMessage);
      return null;
    }
  }, [setCameraLoading, setCameraError, setCameraStream, setPermission]);
  
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      console.log('Stopping camera');
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setCameraStream(null);
  }, [setCameraStream]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);
  
  // Don't auto-request permissions - wait for user interaction on mobile
  
  return {
    videoRef,
    stream: cameraStream,
    isLoading: cameraLoading,
    error: cameraError,
    hasPermission,
    requestPermission,
    startCamera,
    stopCamera
  };
}