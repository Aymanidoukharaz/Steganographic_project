"""
Tkinter GUI interface for the steganographic video encoder.
Provides file selection, progress tracking, and encoding controls.
"""

import tkinter as tk
from tkinter import ttk, filedialog, messagebox
import threading
import os
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent))

from core.video_processor import VideoProcessor, validate_video_file
from core.subtitle_parser import SubtitleParser, validate_subtitle_file
from core.marker_generator import MarkerGenerator
from core.steganographer import SteganographicEmbedder


class EncoderGUI:
    """Main GUI application for steganographic video encoding."""
    
    def __init__(self, root):
        self.root = root
        self.root.title("Encodeur Stéganographique AR - v0.1.0")
        self.root.geometry("800x600")
        self.root.resizable(True, True)
        
        # Initialize components
        self.video_processor = VideoProcessor()
        self.subtitle_parser = SubtitleParser()
        self.marker_generator = None
        self.embedder = None
        
        # GUI state variables
        self.video_file = tk.StringVar()
        self.subtitle_file = tk.StringVar()
        self.output_file = tk.StringVar()
        self.progress_var = tk.DoubleVar()
        self.status_var = tk.StringVar(value="Prêt")
        self.encoding_in_progress = False
        
        self.setup_gui()
        
    def setup_gui(self):
        """Set up the GUI layout and widgets."""
        # Main container
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Configure grid weights
        self.root.columnconfigure(0, weight=1)
        self.root.rowconfigure(0, weight=1)
        main_frame.columnconfigure(1, weight=1)
        
        # Title
        title_label = ttk.Label(main_frame, text="Encodeur de Sous-titres Stéganographiques AR", 
                               font=('Arial', 14, 'bold'))
        title_label.grid(row=0, column=0, columnspan=3, pady=(0, 20))
        
        # Video file selection
        ttk.Label(main_frame, text="Fichier vidéo:").grid(row=1, column=0, sticky=tk.W, pady=5)
        ttk.Entry(main_frame, textvariable=self.video_file, width=50).grid(row=1, column=1, sticky=(tk.W, tk.E), padx=(10, 5))
        ttk.Button(main_frame, text="Parcourir...", command=self.browse_video_file).grid(row=1, column=2, padx=(5, 0))
        
        # Subtitle file selection
        ttk.Label(main_frame, text="Fichier sous-titres:").grid(row=2, column=0, sticky=tk.W, pady=5)
        ttk.Entry(main_frame, textvariable=self.subtitle_file, width=50).grid(row=2, column=1, sticky=(tk.W, tk.E), padx=(10, 5))
        ttk.Button(main_frame, text="Parcourir...", command=self.browse_subtitle_file).grid(row=2, column=2, padx=(5, 0))
        
        # Output file selection
        ttk.Label(main_frame, text="Fichier de sortie:").grid(row=3, column=0, sticky=tk.W, pady=5)
        ttk.Entry(main_frame, textvariable=self.output_file, width=50).grid(row=3, column=1, sticky=(tk.W, tk.E), padx=(10, 5))
        ttk.Button(main_frame, text="Parcourir...", command=self.browse_output_file).grid(row=3, column=2, padx=(5, 0))
        
        # Options frame
        options_frame = ttk.LabelFrame(main_frame, text="Options d'encodage", padding="10")
        options_frame.grid(row=4, column=0, columnspan=3, sticky=(tk.W, tk.E), pady=20)
        options_frame.columnconfigure(1, weight=1)
        
        # Video ID entry
        ttk.Label(options_frame, text="ID Vidéo:").grid(row=0, column=0, sticky=tk.W, pady=5)
        self.video_id_var = tk.StringVar(value="STEGANO_AR_2025")
        ttk.Entry(options_frame, textvariable=self.video_id_var, width=30).grid(row=0, column=1, sticky=tk.W, padx=(10, 0))
        
        # Debug mode checkbox
        self.debug_mode = tk.BooleanVar()
        ttk.Checkbutton(options_frame, text="Mode débogage (marqueurs visibles)", 
                       variable=self.debug_mode).grid(row=1, column=0, columnspan=2, sticky=tk.W, pady=5)
        
        # Progress section
        progress_frame = ttk.LabelFrame(main_frame, text="Progression", padding="10")
        progress_frame.grid(row=5, column=0, columnspan=3, sticky=(tk.W, tk.E), pady=20)
        progress_frame.columnconfigure(0, weight=1)
        
        # Progress bar
        self.progress_bar = ttk.Progressbar(progress_frame, variable=self.progress_var, maximum=100)
        self.progress_bar.grid(row=0, column=0, sticky=(tk.W, tk.E), pady=5)
        
        # Status label
        ttk.Label(progress_frame, textvariable=self.status_var).grid(row=1, column=0, sticky=tk.W)
        
        # Buttons frame
        buttons_frame = ttk.Frame(main_frame)
        buttons_frame.grid(row=6, column=0, columnspan=3, pady=20)
        
        # Encode button
        self.encode_button = ttk.Button(buttons_frame, text="Encoder la vidéo", 
                                       command=self.start_encoding, style="Accent.TButton")
        self.encode_button.pack(side=tk.LEFT, padx=(0, 10))
        
        # Cancel button
        self.cancel_button = ttk.Button(buttons_frame, text="Annuler", 
                                       command=self.cancel_encoding, state=tk.DISABLED)
        self.cancel_button.pack(side=tk.LEFT, padx=10)
        
        # Validate button
        self.validate_button = ttk.Button(buttons_frame, text="Valider l'encodage", 
                                         command=self.validate_encoding)
        self.validate_button.pack(side=tk.LEFT, padx=10)
        
        # Info text area
        info_frame = ttk.LabelFrame(main_frame, text="Informations", padding="10")
        info_frame.grid(row=7, column=0, columnspan=3, sticky=(tk.W, tk.E, tk.N, tk.S), pady=20)
        info_frame.columnconfigure(0, weight=1)
        info_frame.rowconfigure(0, weight=1)
        
        # Text widget with scrollbar
        self.info_text = tk.Text(info_frame, height=8, width=70, wrap=tk.WORD)
        scrollbar = ttk.Scrollbar(info_frame, orient="vertical", command=self.info_text.yview)
        self.info_text.configure(yscrollcommand=scrollbar.set)
        
        self.info_text.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        scrollbar.grid(row=0, column=1, sticky=(tk.N, tk.S))
        
        # Configure row weights for resizing
        main_frame.rowconfigure(7, weight=1)
        
        self.log_info("Application initialisée. Sélectionnez les fichiers pour commencer.")
        
    def browse_video_file(self):
        """Open file dialog to select video file."""
        filetypes = [
            ('Fichiers vidéo', '*.mp4 *.avi *.mov'),
            ('MP4', '*.mp4'),
            ('AVI', '*.avi'),
            ('MOV', '*.mov'),
            ('Tous les fichiers', '*.*')
        ]
        
        filename = filedialog.askopenfilename(
            title="Sélectionner le fichier vidéo",
            filetypes=filetypes
        )
        
        if filename:
            self.video_file.set(filename)
            self.validate_video_file(filename)
            self.suggest_output_filename()
    
    def browse_subtitle_file(self):
        """Open file dialog to select subtitle file."""
        filetypes = [
            ('Fichiers sous-titres', '*.srt *.vtt'),
            ('SRT', '*.srt'),
            ('VTT', '*.vtt'),
            ('Tous les fichiers', '*.*')
        ]
        
        filename = filedialog.askopenfilename(
            title="Sélectionner le fichier de sous-titres",
            filetypes=filetypes
        )
        
        if filename:
            self.subtitle_file.set(filename)
            self.validate_subtitle_file(filename)
    
    def browse_output_file(self):
        """Open file dialog to select output file."""
        filetypes = [
            ('Fichiers MP4', '*.mp4'),
            ('Tous les fichiers', '*.*')
        ]
        
        filename = filedialog.asksaveasfilename(
            title="Sauvegarder la vidéo encodée",
            filetypes=filetypes,
            defaultextension=".mp4"
        )
        
        if filename:
            self.output_file.set(filename)
    
    def suggest_output_filename(self):
        """Suggest output filename based on input video."""
        video_path = self.video_file.get()
        if video_path:
            base_path = Path(video_path)
            suggested_name = base_path.stem + "_encoded" + base_path.suffix
            suggested_path = base_path.parent / suggested_name
            self.output_file.set(str(suggested_path))
    
    def validate_video_file(self, file_path):
        """Validate selected video file."""
        if not validate_video_file(file_path):
            self.log_error(f"Fichier vidéo invalide: {file_path}")
            return False
        
        # Load video and display info
        if self.video_processor.load_video(file_path):
            info = self.video_processor.get_video_info()
            self.log_info(f"Vidéo chargée: {info['width']}x{info['height']}, "
                         f"{info['fps']:.1f} FPS, {info['total_frames']} images, "
                         f"{info['duration']:.1f}s")
            
            # Initialize embedder with correct FPS
            self.embedder = SteganographicEmbedder(info['fps'])
            
            # Validate embedding capacity
            if self.embedder.validate_embedding_capacity(info['width'], info['height']):
                capacity = self.embedder.estimate_capacity(info['width'], info['height'])
                self.log_info(f"Capacité d'encodage: {capacity['total_capacity_bytes']} octets")
            else:
                self.log_error("Résolution vidéo insuffisante pour l'encodage stéganographique")
                return False
            
            return True
        else:
            self.log_error(f"Impossible de charger la vidéo: {file_path}")
            return False
    
    def validate_subtitle_file(self, file_path):
        """Validate selected subtitle file."""
        if not validate_subtitle_file(file_path):
            self.log_error(f"Fichier sous-titres invalide: {file_path}")
            return False
        
        # Load and parse subtitle file
        if self.subtitle_parser.load_subtitle_file(file_path):
            stats = self.subtitle_parser.get_statistics()
            self.log_info(f"Sous-titres chargés: {stats['count']} entrées, "
                         f"durée totale {stats['total_span_ms']/1000:.1f}s")
            
            # Validate timing
            issues = self.subtitle_parser.validate_timing()
            if issues:
                self.log_warning("Problèmes de timing détectés:")
                for issue in issues[:5]:  # Show first 5 issues
                    self.log_warning(f"  - {issue}")
            
            return True
        else:
            self.log_error(f"Impossible de charger les sous-titres: {file_path}")
            return False
    
    def start_encoding(self):
        """Start the encoding process in a separate thread."""
        # Validate inputs
        if not self.video_file.get():
            messagebox.showerror("Erreur", "Veuillez sélectionner un fichier vidéo")
            return
        
        if not self.subtitle_file.get():
            messagebox.showerror("Erreur", "Veuillez sélectionner un fichier de sous-titres")
            return
        
        if not self.output_file.get():
            messagebox.showerror("Erreur", "Veuillez spécifier le fichier de sortie")
            return
        
        # Set GUI state
        self.encoding_in_progress = True
        self.encode_button.config(state=tk.DISABLED)
        self.cancel_button.config(state=tk.NORMAL)
        self.progress_var.set(0)
        self.status_var.set("Démarrage de l'encodage...")
        
        # Start encoding thread
        self.encoding_thread = threading.Thread(target=self.encode_video_thread)
        self.encoding_thread.daemon = True
        self.encoding_thread.start()
    
    def encode_video_thread(self):
        """Encoding process running in separate thread."""
        try:
            self.log_info("=== Début de l'encodage ===")
            
            # Initialize marker generator
            video_id = self.video_id_var.get() or "STEGANO_AR_2025"
            self.marker_generator = MarkerGenerator(video_id)
            
            # Extract frames from video
            self.update_status("Extraction des images vidéo...")
            frames = self.video_processor.extract_frames(self.update_progress)
            
            if not frames:
                self.log_error("Échec de l'extraction des images")
                return
            
            self.log_info(f"Images extraites: {len(frames)}")
            
            # Get subtitle data
            subtitles = self.subtitle_parser.get_subtitles()
            self.log_info(f"Sous-titres à encoder: {len(subtitles)}")
            
            # Process each frame
            self.update_status("Encodage des données stéganographiques...")
            processed_frames = []
            
            for i, frame in enumerate(frames):
                if not self.encoding_in_progress:  # Check for cancellation
                    return
                
                # Embed corner markers
                frame_with_markers = self.marker_generator.embed_markers_in_frame(frame)
                
                # Prepare subtitle data for this frame
                subtitle_data = self.embedder.prepare_subtitle_data_for_frame(subtitles, i)
                
                # Calculate timestamp
                timestamp_ms = int(i * self.embedder.frame_duration_ms)
                
                # Embed steganographic data
                processed_frame = self.embedder.embed_frame_data(
                    frame_with_markers, i, timestamp_ms, subtitle_data
                )
                
                processed_frames.append(processed_frame)
                
                # Update progress (30-70%)
                progress = 30 + (i + 1) / len(frames) * 40
                self.update_progress(progress / 100.0)
            
            if not self.encoding_in_progress:
                return
            
            # Save processed video
            self.update_status("Sauvegarde de la vidéo encodée...")
            success = self.video_processor.save_frames_as_video(
                processed_frames, self.output_file.get(), self.update_progress
            )
            
            if success:
                self.update_status("Encodage terminé avec succès!")
                self.log_info("=== Encodage terminé avec succès ===")
                messagebox.showinfo("Succès", 
                                   f"Vidéo encodée sauvegardée: {self.output_file.get()}")
            else:
                self.log_error("Échec de la sauvegarde de la vidéo")
                messagebox.showerror("Erreur", "Échec de la sauvegarde de la vidéo")
                
        except Exception as e:
            self.log_error(f"Erreur lors de l'encodage: {str(e)}")
            messagebox.showerror("Erreur", f"Erreur lors de l'encodage: {str(e)}")
        
        finally:
            # Reset GUI state
            self.root.after(0, self.encoding_finished)
    
    def cancel_encoding(self):
        """Cancel the encoding process."""
        self.encoding_in_progress = False
        self.update_status("Annulation en cours...")
        self.log_info("Encodage annulé par l'utilisateur")
    
    def encoding_finished(self):
        """Called when encoding is finished or cancelled."""
        self.encoding_in_progress = False
        self.encode_button.config(state=tk.NORMAL)
        self.cancel_button.config(state=tk.DISABLED)
        self.progress_var.set(0)
        
        if self.status_var.get().startswith("Annulation"):
            self.status_var.set("Encodage annulé")
        elif not self.status_var.get().startswith("Encodage terminé"):
            self.status_var.set("Prêt")
    
    def validate_encoding(self):
        """Validate the encoding by checking embedded data."""
        output_path = self.output_file.get()
        
        if not output_path or not os.path.exists(output_path):
            messagebox.showerror("Erreur", "Fichier de sortie non trouvé pour validation")
            return
        
        self.log_info("=== Validation de l'encodage ===")
        
        # TODO: Implement validation logic
        # This would involve loading the encoded video and attempting to extract
        # the embedded data to verify it matches the original
        
        messagebox.showinfo("Validation", 
                           "Fonction de validation en cours de développement")
    
    def update_progress(self, progress):
        """Update progress bar from thread."""
        self.root.after(0, lambda: self.progress_var.set(progress * 100))
    
    def update_status(self, status):
        """Update status label from thread."""
        self.root.after(0, lambda: self.status_var.set(status))
    
    def log_info(self, message):
        """Add info message to log."""
        self.root.after(0, lambda: self._append_log(f"INFO: {message}\n"))
    
    def log_warning(self, message):
        """Add warning message to log."""
        self.root.after(0, lambda: self._append_log(f"ATTENTION: {message}\n"))
    
    def log_error(self, message):
        """Add error message to log."""
        self.root.after(0, lambda: self._append_log(f"ERREUR: {message}\n"))
    
    def _append_log(self, message):
        """Append message to info text widget."""
        self.info_text.insert(tk.END, message)
        self.info_text.see(tk.END)


def main():
    """Main application entry point."""
    root = tk.Tk()
    app = EncoderGUI(root)
    
    try:
        root.mainloop()
    except KeyboardInterrupt:
        pass
    finally:
        # Clean up
        if hasattr(app, 'video_processor'):
            app.video_processor.cleanup()


if __name__ == "__main__":
    main()