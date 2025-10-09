/**
 * French UI Text Constants
 * All user-facing text in French for complete localization
 */
export const FRENCH_TEXT = {
  // Navigation
  navigation: {
    settings: "Paramètres",
    tutorial: "Tutoriel",
    about: "À propos",
    back: "Retour",
    home: "Accueil",
  },

  // App Info
  app: {
    title: "Décodeur de Sous-titres AR",
    shortTitle: "AR Subtitles",
    tagline: "Réalité augmentée pour sous-titres cachés",
  },

  // Home Screen Status
  status: {
    idle: "Pointez la caméra vers un écran encodé",
    searching: "Recherche en cours...",
    analyzing: "Analyse...",
    detected: "Vidéo détectée!",
    decoding: "Décodage en cours...",
    active: "Lecture des sous-titres",
    error: "Erreur de détection",
    connectionError: "Erreur de connexion",
  },

  // Camera
  camera: {
    permissionRequest: "Accès à la caméra requis",
    permissionDenied: "Accès à la caméra refusé",
    permissionInstructions: "Veuillez autoriser l'accès à la caméra dans les paramètres de votre navigateur",
    loading: "Initialisation de la caméra...",
    error: "Impossible d'accéder à la caméra",
    retry: "Réessayer",
    switchCamera: "Changer de caméra",
  },

  // Detection Overlay
  detection: {
    guidance: "Pointez votre caméra vers un écran avec une vidéo encodée",
    tips: "Conseils :",
    tip1: "Maintenez une distance de 1 à 2 mètres",
    tip2: "Assurez-vous que l'écran est bien éclairé",
    tip3: "Gardez la caméra stable",
    searching: "Recherche de marqueurs vidéo...",
  },

  // Settings Screen
  settings: {
    title: "Paramètres",
    
    // Subtitle Style Section
    subtitleStyle: "Style des sous-titres",
    textSize: "Taille du texte",
    color: "Couleur",
    background: "Arrière-plan",
    livePreview: "Aperçu en direct",
    previewText: "Exemple de sous-titre",
    
    // Text Sizes
    textSizes: {
      small: "Petit",
      medium: "Moyen",
      large: "Grand",
    },
    
    // Colors
    colors: {
      white: "Blanc",
      yellow: "Jaune",
      cyan: "Cyan",
    },
    
    // Backgrounds
    backgrounds: {
      transparent: "Transparent",
      semi: "Semi-transparent",
      solid: "Solide",
    },
    
    // Performance Section
    performance: "Performance",
    processingQuality: "Qualité de traitement",
    showFPS: "Afficher les FPS",
    showDebug: "Mode débogage",
    
    // Qualities
    qualities: {
      low: "Faible",
      medium: "Moyenne",
      high: "Élevée",
    },
    
    // About Section (in Settings)
    aboutApp: "À propos de l'application",
    version: "Version",
    author: "Auteur",
    authorName: "AYMAN IDOUKHARAZ",
    
    // Actions
    save: "Enregistrer",
    reset: "Réinitialiser",
    cancel: "Annuler",
    apply: "Appliquer",
  },

  // Tutorial Screen
  tutorial: {
    title: "Comment ça marche",
    subtitle: "Guide d'utilisation en 4 étapes",
    
    // Steps
    step1Title: "Encoder une vidéo",
    step1Description: "Utilisez l'encodeur Python pour intégrer des sous-titres dans une vidéo de manière steganographique",
    
    step2Title: "Lire la vidéo encodée",
    step2Description: "Lancez la vidéo encodée sur un écran d'ordinateur portable ou de bureau",
    
    step3Title: "Pointer la caméra vers l'écran",
    step3Description: "Ouvrez cette application et dirigez la caméra de votre appareil vers l'écran",
    
    step4Title: "Les sous-titres apparaissent",
    step4Description: "Les sous-titres cachés s'affichent automatiquement en réalité augmentée",
    
    // Tips Section
    tipsTitle: "Conseils pour une meilleure détection",
    tips: {
      tip1: "Maintenez une distance de 1 à 2 mètres de l'écran",
      tip2: "Assurez-vous d'un bon éclairage ambiant",
      tip3: "Évitez les reflets sur l'écran",
      tip4: "Gardez l'appareil aussi stable que possible",
      tip5: "Pointez perpendiculairement vers l'écran",
    },
    
    // Troubleshooting
    troubleshootingTitle: "Dépannage",
    troubleshooting: {
      issue1: "La vidéo n'est pas détectée",
      solution1: "Vérifiez que la vidéo est bien encodée et que l'éclairage est suffisant",
      issue2: "Les sous-titres ne s'affichent pas",
      solution2: "Rapprochez-vous ou éloignez-vous de l'écran pour améliorer la détection",
      issue3: "Performance lente",
      solution3: "Réduisez la qualité de traitement dans les paramètres",
    },
    
    // Action
    startButton: "Commencer",
    backToApp: "Retour à l'application",
  },

  // About Screen
  about: {
    title: "À propos",
    
    // App Info
    appInfo: "Informations sur l'application",
    description: "Un système de sous-titres AR utilisant la stéganographie pour encoder et décoder des sous-titres dans les flux vidéo en temps réel.",
    
    // Project Info
    projectInfo: "Informations sur le projet",
    projectType: "Type de projet",
    projectTypeValue: "Progressive Web App (PWA)",
    technology: "Technologie",
    technologyValue: "React + Vite + OpenCV.js",
    course: "Cours",
    courseValue: "Interface Homme-Machine",
    institution: "Institution",
    institutionValue: "Master en France",
    
    // Features
    featuresTitle: "Fonctionnalités",
    features: {
      feature1: "Détection vidéo en temps réel",
      feature2: "Décodage steganographique",
      feature3: "Correction de perspective 3D",
      feature4: "Interface en français",
      feature5: "Fonctionnement hors ligne (PWA)",
    },
    
    // Credits
    creditsTitle: "Crédits",
    developedBy: "Développé par",
    poweredBy: "Propulsé par",
    technologies: {
      react: "React 18",
      vite: "Vite 5",
      opencv: "OpenCV.js",
      tailwind: "Tailwind CSS",
    },
    
    // License
    licenseTitle: "Licence",
    license: "MIT License",
    licenseDescription: "Open source pour un usage éducatif",
    
    // Links
    linksTitle: "Liens",
    documentation: "Documentation",
    sourceCode: "Code source",
    reportIssue: "Signaler un problème",
    
    // Version Info
    versionInfo: "Informations de version",
    currentVersion: "1.0.0",
    releaseDate: "Date de sortie",
    releaseDateValue: "Octobre 2025",
  },

  // Actions & Buttons
  actions: {
    start: "Démarrer",
    stop: "Arrêter",
    retry: "Réessayer",
    close: "Fermer",
    ok: "OK",
    yes: "Oui",
    no: "Non",
    enable: "Activer",
    disable: "Désactiver",
    learnMore: "En savoir plus",
  },

  // Errors & Messages
  errors: {
    generic: "Une erreur s'est produite",
    cameraAccess: "Impossible d'accéder à la caméra",
    noVideoDetected: "Aucune vidéo détectée",
    decodingFailed: "Échec du décodage",
    networkError: "Erreur réseau",
    storageError: "Erreur de stockage",
  },

  // Success Messages
  success: {
    settingsSaved: "Paramètres enregistrés",
    cameraStarted: "Caméra activée",
    videoDetected: "Vidéo détectée avec succès",
  },

  // Performance Metrics
  metrics: {
    fps: "FPS",
    latency: "Latence",
    confidence: "Confiance",
    processing: "Traitement",
  },

  // Accessibility
  aria: {
    closeButton: "Fermer",
    settingsButton: "Ouvrir les paramètres",
    tutorialButton: "Ouvrir le tutoriel",
    aboutButton: "À propos de l'application",
    backButton: "Retour",
    cameraView: "Vue caméra en direct",
    statusIndicator: "Indicateur de statut",
    subtitleDisplay: "Affichage des sous-titres",
  },
};

// Legacy UI_TEXT for backward compatibility
export const UI_TEXT = {
  app: FRENCH_TEXT.app,
  camera: FRENCH_TEXT.camera,
  status: FRENCH_TEXT.status,
  buttons: {
    retry: FRENCH_TEXT.camera.retry,
    settings: FRENCH_TEXT.navigation.settings,
    help: FRENCH_TEXT.navigation.tutorial,
  }
};

export const DETECTION_STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SEARCHING: 'searching',
  DETECTING: 'detecting', 
  DETECTED: 'detected',
  ACTIVE: 'active',
  ERROR: 'error'
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