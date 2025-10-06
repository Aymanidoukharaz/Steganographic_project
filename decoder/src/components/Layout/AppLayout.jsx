import React from 'react';
import { OrientationGuard } from '../UI/OrientationGuard';
import { InstallPrompt } from '../UI/InstallPrompt';
import { CameraView } from '../Camera/CameraView';
import { MinimalControls } from '../UI/MinimalControls';
import { useApp } from '../../contexts/AppContext';

export function AppLayout() {
  const { state: { hasPermission } } = useApp();
  
  return (
    <OrientationGuard>
      <div className="fixed inset-0 bg-black overflow-hidden">
        {/* PWA Install Prompt */}
        <InstallPrompt />
        
        {/* Full-screen Camera View */}
        <CameraView />
        
        {/* Minimal AR UI Overlay - only show when camera is active */}
        {hasPermission === true && <MinimalControls />}
      </div>
    </OrientationGuard>
  );
}