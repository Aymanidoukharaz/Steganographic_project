import { useState, useEffect } from 'react';

export function usePermissions() {
  const [cameraPermission, setCameraPermission] = useState(null);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    // Check if getUserMedia is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setIsSupported(false);
      return;
    }

    // Check permissions if API is available
    if ('permissions' in navigator) {
      checkCameraPermission();
    }
  }, []);

  const checkCameraPermission = async () => {
    try {
      const permission = await navigator.permissions.query({ name: 'camera' });
      setCameraPermission(permission.state);
      
      // Listen for permission changes
      permission.addEventListener('change', () => {
        setCameraPermission(permission.state);
      });
    } catch (error) {
      console.log('Permissions API not fully supported:', error);
      // Fallback: we'll determine permission when trying to access camera
      setCameraPermission('prompt');
    }
  };

  const requestCameraPermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' },
        audio: false 
      });
      setCameraPermission('granted');
      return true;
    } catch (error) {
      if (error.name === 'NotAllowedError') {
        setCameraPermission('denied');
      }
      return false;
    }
  };

  return {
    cameraPermission,
    isSupported,
    requestCameraPermission,
    checkCameraPermission
  };
}