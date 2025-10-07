import React, { createContext, useContext, useReducer } from 'react';
import { DETECTION_STATUS } from '../utils/constants';

const AppContext = createContext();

// Load persisted permission state
const getInitialPermissionState = () => {
  try {
    const stored = localStorage.getItem('camera-permission-granted');
    return stored === 'true' ? true : null;
  } catch {
    return null;
  }
};

const initialState = {
  // Camera state
  cameraStream: null,
  cameraError: null,
  cameraLoading: false,
  hasPermission: getInitialPermissionState(),
  
  // Detection state
  detectionStatus: DETECTION_STATUS.IDLE,
  detectionConfidence: 0,
  
  // CV state (Phase 3)
  homographyMatrix: null,
  cornerPositions: null,
  cvInitialized: false,
  cvLoading: false,
  
  // Performance metrics
  processingFPS: 0,
  renderFPS: 0,
  
  // UI state
  isFullscreen: false,
  showDebugInfo: false
};

/**
 * Application state reducer
 * Manages camera, detection, and UI state
 */
function appReducer(state, action) {
  switch (action.type) {
    case 'SET_CAMERA_STREAM':
      return {
        ...state,
        cameraStream: action.payload,
        cameraLoading: false,
        cameraError: null
      };
      
    case 'SET_CAMERA_LOADING':
      return {
        ...state,
        cameraLoading: action.payload
      };
      
    case 'SET_CAMERA_ERROR':
      return {
        ...state,
        cameraError: action.payload,
        cameraLoading: false,
        cameraStream: null
      };
      
    case 'SET_PERMISSION':
      // Persist permission state to localStorage
      try {
        if (action.payload === true) {
          localStorage.setItem('camera-permission-granted', 'true');
        } else {
          localStorage.removeItem('camera-permission-granted');
        }
      } catch (e) {
        console.warn('Could not persist permission state:', e);
      }
      
      return {
        ...state,
        hasPermission: action.payload
      };
      
    case 'SET_DETECTION_STATUS':
      return {
        ...state,
        detectionStatus: action.payload
      };
      
    case 'SET_DETECTION_CONFIDENCE':
      return {
        ...state,
        detectionConfidence: action.payload
      };
      
    case 'SET_HOMOGRAPHY':
      return {
        ...state,
        homographyMatrix: action.payload
      };
      
    case 'SET_CORNER_POSITIONS':
      return {
        ...state,
        cornerPositions: action.payload
      };
      
    case 'SET_CV_INITIALIZED':
      return {
        ...state,
        cvInitialized: action.payload,
        cvLoading: false
      };
      
    case 'SET_CV_LOADING':
      return {
        ...state,
        cvLoading: action.payload
      };
      
    case 'SET_PROCESSING_FPS':
      return {
        ...state,
        processingFPS: action.payload
      };
      
    case 'SET_RENDER_FPS':
      return {
        ...state,
        renderFPS: action.payload
      };
      
    case 'TOGGLE_FULLSCREEN':
      return {
        ...state,
        isFullscreen: !state.isFullscreen
      };
      
    case 'TOGGLE_DEBUG_INFO':
      return {
        ...state,
        showDebugInfo: !state.showDebugInfo
      };
      
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  const value = {
    state,
    dispatch,
    // Action creators
    setCameraStream: (stream) => dispatch({ type: 'SET_CAMERA_STREAM', payload: stream }),
    setCameraLoading: (loading) => dispatch({ type: 'SET_CAMERA_LOADING', payload: loading }),
    setCameraError: (error) => dispatch({ type: 'SET_CAMERA_ERROR', payload: error }),
    setPermission: (permission) => dispatch({ type: 'SET_PERMISSION', payload: permission }),
    setDetectionStatus: (status) => dispatch({ type: 'SET_DETECTION_STATUS', payload: status }),
    setDetectionConfidence: (confidence) => dispatch({ type: 'SET_DETECTION_CONFIDENCE', payload: confidence }),
    setHomography: (matrix) => dispatch({ type: 'SET_HOMOGRAPHY', payload: matrix }),
    setCornerPositions: (positions) => dispatch({ type: 'SET_CORNER_POSITIONS', payload: positions }),
    setCVInitialized: (initialized) => dispatch({ type: 'SET_CV_INITIALIZED', payload: initialized }),
    setCVLoading: (loading) => dispatch({ type: 'SET_CV_LOADING', payload: loading }),
    setProcessingFPS: (fps) => dispatch({ type: 'SET_PROCESSING_FPS', payload: fps }),
    setRenderFPS: (fps) => dispatch({ type: 'SET_RENDER_FPS', payload: fps }),
    toggleFullscreen: () => dispatch({ type: 'TOGGLE_FULLSCREEN' }),
    toggleDebugInfo: () => dispatch({ type: 'TOGGLE_DEBUG_INFO' })
  };
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}