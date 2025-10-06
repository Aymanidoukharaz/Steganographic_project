export const UI_TEXT = {
  app: {
    title: "Décodeur de Sous-titres AR",
    shortTitle: "AR Subtitles"
  },
  camera: {
    permissionRequest: "Accès à la caméra requis",
    permissionDenied: "Accès à la caméra refusé",
    loading: "Initialisation de la caméra...",
    error: "Impossible d'accéder à la caméra"
  },
  status: {
    idle: "Pointez la caméra vers un écran encodé",
    searching: "Recherche en cours...",
    detecting: "Détection en cours...",
    active: "Vidéo détectée!"
  },
  buttons: {
    retry: "Réessayer",
    settings: "Paramètres",
    help: "Aide"
  }
};

export const DETECTION_STATUS = {
  IDLE: 'idle',
  SEARCHING: 'searching',
  DETECTING: 'detecting', 
  ACTIVE: 'active'
};

export const CAMERA_CONSTRAINTS = {
  video: {
    facingMode: 'environment', // Rear camera
    width: { ideal: 1280 },
    height: { ideal: 720 },
    frameRate: { ideal: 30, min: 15 }
  },
  audio: false
};