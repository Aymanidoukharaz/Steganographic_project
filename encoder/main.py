#!/usr/bin/env python3
"""
Main entry point for the Steganographic AR Subtitles Encoder.
Launches the Tkinter GUI interface for encoding videos with embedded subtitles.
"""

import sys
import os
from pathlib import Path

# Ensure proper imports
current_dir = Path(__file__).parent
sys.path.insert(0, str(current_dir))

try:
    import tkinter as tk
    from tkinter import messagebox
except ImportError:
    print("Erreur: Tkinter n'est pas disponible. Veuillez installer Python avec support Tkinter.")
    sys.exit(1)

try:
    # Test critical imports
    import cv2
    import numpy as np
    import pysrt
    import webvtt
    import lz4.frame
except ImportError as e:
    error_msg = f"""
Erreur: Dépendance manquante: {str(e)}

Veuillez installer les dépendances requises:
    pip install -r requirements.txt

Dépendances requises:
- opencv-python==4.8.1.78
- numpy==1.24.3
- Pillow==10.0.1
- pysrt==1.1.2
- webvtt-py==0.4.6
- lz4==4.3.2
"""
    print(error_msg)
    
    # Try to show GUI error if possible
    try:
        root = tk.Tk()
        root.withdraw()
        messagebox.showerror("Dépendances manquantes", error_msg)
    except:
        pass
    
    sys.exit(1)

from gui.encoder_gui import EncoderGUI


def check_system_requirements():
    """Check if system meets minimum requirements."""
    issues = []
    
    # Check Python version
    if sys.version_info < (3, 8):
        issues.append(f"Python 3.8+ requis (version actuelle: {sys.version})")
    
    # Check OpenCV
    try:
        cv_version = cv2.__version__
        print(f"OpenCV version: {cv_version}")
    except:
        issues.append("OpenCV non disponible")
    
    # Check numpy
    try:
        np_version = np.__version__
        print(f"NumPy version: {np_version}")
    except:
        issues.append("NumPy non disponible")
    
    return issues


def main():
    """Main application entry point."""
    print("=== Encodeur Stéganographique AR v0.1.0 ===")
    print("Auteur: AYMAN IDOUKHARAZ")
    print("Démarrage de l'application...")
    
    # Check system requirements
    issues = check_system_requirements()
    if issues:
        error_msg = "Problèmes système détectés:\n" + "\n".join(f"- {issue}" for issue in issues)
        print(f"ERREUR: {error_msg}")
        
        try:
            root = tk.Tk()
            root.withdraw()
            messagebox.showerror("Problèmes système", error_msg)
        except:
            pass
        
        return 1
    
    try:
        # Create and run GUI
        root = tk.Tk()
        
        # Set icon and basic properties
        root.title("Encodeur Stéganographique AR")
        
        # Try to set window icon (optional)
        try:
            # You can add an icon file here if desired
            pass
        except:
            pass
        
        # Initialize application
        app = EncoderGUI(root)
        
        print("Interface graphique initialisée")
        print("Prêt pour l'encodage!")
        
        # Start main loop
        root.mainloop()
        
        print("Application fermée")
        return 0
        
    except KeyboardInterrupt:
        print("\nApplication interrompue par l'utilisateur")
        return 0
        
    except Exception as e:
        error_msg = f"Erreur fatale: {str(e)}"
        print(f"ERREUR: {error_msg}")
        
        try:
            root = tk.Tk()
            root.withdraw()
            messagebox.showerror("Erreur fatale", error_msg)
        except:
            pass
        
        return 1


if __name__ == "__main__":
    sys.exit(main())