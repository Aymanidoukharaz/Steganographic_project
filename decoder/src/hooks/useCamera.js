import { useEffect, useRef, useCallback } from 'react';
import { useApp } from '../contexts/AppContext';
import { CAMERA_CONSTRAINTS } from '../utils/constants';

/**
 * useCamera Hook
 * Manages camera access, permissions, and stream lifecycle
 * 
 * Features:
 * - Camera permission request and management
 * - Rear camera prioritization (environment facing)
 * - Stream lifecycle management
 * - Error handling with French error messages
 * - Cleanup on component unmount
 * 
 * @hook
 * @returns {Object} Camera controls and state
 * @returns {React.RefObject} videoRef - Reference to video element
 * @returns {MediaStream|null} stream - Active camera stream
 * @returns {boolean} isLoading - Loading state
 * @returns {string|null} error - Error message (French)
 * @returns {boolean|null} hasPermission - Permission status
 * @returns {Function} requestPermission - Request camera access
 * @returns {Function} startCamera - Start camera stream
 * @returns {Function} stopCamera - Stop camera and cleanup
 */
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
  
  /**
   * Request camera permission and initialize camera stream
   * Attempts rear camera first, falls back to any available camera
   * @returns {Promise<boolean>} True if permission granted
   */
  const requestPermission = useCallback(async () => {
    try {
      setCameraLoading(true);
      setCameraError(null);
      
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
      
      // Use the stream as the active camera stream
      streamRef.current = testStream;
      setCameraStream(testStream);
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
  }, [setCameraLoading, setCameraError, setPermission, setCameraStream]);
  
  /**
   * Start camera stream with specified constraints
   * @returns {Promise<MediaStream>} Active camera stream
   */
  const startCamera = useCallback(async () => {
    if (streamRef.current) {
      return streamRef.current;
    }
    
    try {
      setCameraLoading(true);
      setCameraError(null);
      
      const stream = await navigator.mediaDevices.getUserMedia(CAMERA_CONSTRAINTS);
      
      streamRef.current = stream;
      setCameraStream(stream);
      setCameraLoading(false);
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
          return fallbackStream;
          
        } catch (fallbackError) {
          console.error('Fallback camera also failed:', fallbackError);
          setCameraError('Impossible de démarrer la caméra avec les paramètres disponibles.');
          throw fallbackError;
        }
      }
      
      setCameraError(errorMessage);
      throw error;
    }
  }, [setCameraLoading, setCameraError, setCameraStream, setPermission]);
  
  /**
   * Stop camera stream and release resources
   */
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setCameraStream(null);
  }, []);
  
  /**
   * Cleanup camera stream on component unmount
   */
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, []); // Empty deps - only run on mount/unmount
  
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