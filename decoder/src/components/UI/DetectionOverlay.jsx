/**
 * Detection Overlay Component
 * Displays corner highlights, screen outline, and confidence metrics on camera feed
 */

import React, { useEffect, useRef } from 'react';
import { useApp } from '../../contexts/AppContext';
import { DETECTION_STATUS } from '../../utils/constants';

export default function DetectionOverlay() {
  const { state } = useApp();
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);

  /**
   * Draw detection overlay
   */
  const drawOverlay = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Only draw if we have corner positions
    if (!state.cornerPositions || state.cornerPositions.length !== 4) {
      return;
    }

    // Draw detected screen outline
    drawScreenOutline(ctx, state.cornerPositions, state.detectionConfidence);

    // Draw corner markers
    drawCornerMarkers(ctx, state.cornerPositions, state.detectionConfidence);

    // Draw confidence indicator
    if (state.showDebugInfo) {
      drawDebugInfo(ctx, state);
    }
  };

  /**
   * Draw screen outline (4-point polygon)
   */
  const drawScreenOutline = (ctx, corners, confidence) => {
    ctx.save();

    // Set stroke style based on confidence
    const hue = confidence * 120; // Green at high confidence, red at low
    ctx.strokeStyle = `hsla(${hue}, 100%, 50%, ${0.6 + confidence * 0.4})`;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Draw polygon connecting all 4 corners
    ctx.beginPath();
    ctx.moveTo(corners[0].x, corners[0].y);
    for (let i = 1; i < corners.length; i++) {
      ctx.lineTo(corners[i].x, corners[i].y);
    }
    ctx.closePath();
    ctx.stroke();

    // Add glow effect
    ctx.shadowColor = `hsla(${hue}, 100%, 50%, 0.8)`;
    ctx.shadowBlur = 10;
    ctx.stroke();

    ctx.restore();
  };

  /**
   * Draw corner markers
   */
  const drawCornerMarkers = (ctx, corners, confidence) => {
    const labels = ['TL', 'TR', 'BR', 'BL'];
    const colors = ['#00ff00', '#00ffff', '#ffff00', '#ff00ff'];

    corners.forEach((corner, index) => {
      ctx.save();

      // Draw corner circle
      const radius = 12;
      const alpha = 0.7 + confidence * 0.3;

      ctx.fillStyle = colors[index];
      ctx.globalAlpha = alpha;

      ctx.beginPath();
      ctx.arc(corner.x, corner.y, radius, 0, Math.PI * 2);
      ctx.fill();

      // Draw corner crosshair
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.globalAlpha = 1;

      ctx.beginPath();
      ctx.moveTo(corner.x - radius - 5, corner.y);
      ctx.lineTo(corner.x + radius + 5, corner.y);
      ctx.moveTo(corner.x, corner.y - radius - 5);
      ctx.lineTo(corner.x, corner.y + radius + 5);
      ctx.stroke();

      // Draw label
      if (state.showDebugInfo) {
        ctx.font = 'bold 12px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.strokeText(labels[index], corner.x + 20, corner.y - 10);
        ctx.fillText(labels[index], corner.x + 20, corner.y - 10);
      }

      ctx.restore();
    });
  };

  /**
   * Draw debug information
   */
  const drawDebugInfo = (ctx, state) => {
    ctx.save();

    // Background for debug info
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, 10, 280, 140);

    // Debug text
    ctx.font = '14px monospace';
    ctx.fillStyle = '#00ff00';

    const lines = [
      `Status: ${getStatusText(state.detectionStatus)}`,
      `Confidence: ${(state.detectionConfidence * 100).toFixed(1)}%`,
      `Processing FPS: ${state.processingFPS}`,
      `Render FPS: ${state.renderFPS}`,
      `CV Initialized: ${state.cvInitialized ? 'Yes' : 'No'}`,
      `Corners: ${state.cornerPositions ? '4 detected' : 'None'}`
    ];

    lines.forEach((line, index) => {
      ctx.fillText(line, 20, 35 + index * 20);
    });

    ctx.restore();
  };

  /**
   * Get status text in French
   */
  const getStatusText = (status) => {
    switch (status) {
      case DETECTION_STATUS.IDLE:
        return 'En attente';
      case DETECTION_STATUS.LOADING:
        return 'Chargement...';
      case DETECTION_STATUS.SEARCHING:
        return 'Recherche...';
      case DETECTION_STATUS.DETECTED:
        return 'Détecté';
      case DETECTION_STATUS.ERROR:
        return 'Erreur';
      default:
        return status;
    }
  };

  /**
   * Animation loop
   */
  const animate = () => {
    drawOverlay();
    animationFrameRef.current = requestAnimationFrame(animate);
  };

  /**
   * Handle canvas resize
   */
  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;
  };

  /**
   * Setup and cleanup
   */
  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Start animation loop
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  /**
   * Redraw when detection state changes
   */
  useEffect(() => {
    drawOverlay();
  }, [state.cornerPositions, state.detectionConfidence, state.showDebugInfo]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-20"
        style={{ mixBlendMode: 'screen' }}
      />
      
      {/* Phase 4: Subtitle Display Overlay */}
      {state.currentSubtitle && (
        <div className="absolute bottom-0 left-0 right-0 z-30 flex justify-center pb-20 pointer-events-none">
          <div className="bg-black/90 text-white px-6 py-3 rounded-lg max-w-[90%] text-center shadow-2xl">
            <p className="text-xl md:text-2xl font-bold leading-tight">
              {state.currentSubtitle.text}
            </p>
            {state.showDebugInfo && (
              <p className="text-xs text-gray-400 mt-1">
                {state.currentSubtitle.startTime}ms - {state.currentSubtitle.endTime}ms
                {state.currentSubtitle.estimated && ' (estimé)'}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
