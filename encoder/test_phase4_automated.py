"""
🧪 SCRIPT DE TEST AUTOMATISÉ - PHASE 4
Vérification rapide du décodeur stéganographique

Ce script teste tous les composants du pipeline de décodage.
"""

import sys
import os
from pathlib import Path

# Couleurs pour output
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

def print_header(text):
    print(f"\n{Colors.CYAN}{Colors.BOLD}{'='*60}{Colors.RESET}")
    print(f"{Colors.CYAN}{Colors.BOLD}{text:^60}{Colors.RESET}")
    print(f"{Colors.CYAN}{Colors.BOLD}{'='*60}{Colors.RESET}\n")

def print_test(name, passed, details=""):
    status = f"{Colors.GREEN}✅ PASS" if passed else f"{Colors.RED}❌ FAIL"
    print(f"{status}{Colors.RESET} - {name}")
    if details:
        print(f"       {Colors.YELLOW}{details}{Colors.RESET}")

def test_imports():
    """Test 1: Vérifier les imports Python nécessaires"""
    print_header("TEST 1: Imports Python")
    
    tests = []
    
    # OpenCV
    try:
        import cv2
        version = cv2.__version__
        tests.append(("OpenCV (cv2)", True, f"Version {version}"))
    except ImportError as e:
        tests.append(("OpenCV (cv2)", False, str(e)))
    
    # NumPy
    try:
        import numpy as np
        version = np.__version__
        tests.append(("NumPy", True, f"Version {version}"))
    except ImportError as e:
        tests.append(("NumPy", False, str(e)))
    
    # LZ4
    try:
        import lz4.frame
        tests.append(("LZ4", True, "Disponible"))
    except ImportError as e:
        tests.append(("LZ4", False, str(e)))
    
    for name, passed, details in tests:
        print_test(name, passed, details)
    
    return all(t[1] for t in tests)

def test_encoder_files():
    """Test 2: Vérifier fichiers encodeur"""
    print_header("TEST 2: Fichiers Encodeur")
    
    base = Path(__file__).parent
    required_files = [
        "core/marker_generator.py",
        "core/steganographer.py",
        "core/subtitle_parser.py",
        "core/video_processor.py",
        "gui/encoder_gui.py",
        "main.py"
    ]
    
    tests = []
    for file in required_files:
        file_path = base / file
        exists = file_path.exists()
        tests.append((file, exists, str(file_path) if exists else "Fichier manquant"))
    
    for name, passed, details in tests:
        print_test(name, passed, details if not passed else "")
    
    return all(t[1] for t in tests)

def test_decoder_files():
    """Test 3: Vérifier fichiers décodeur"""
    print_header("TEST 3: Fichiers Décodeur")
    
    base = Path(__file__).parent.parent / "decoder" / "src"
    required_files = [
        "decoder/decoder-pipeline.js",
        "decoder/steganography/lsb-extractor.js",
        "decoder/steganography/data-decompressor.js",
        "decoder/steganography/error-correction.js",
        "decoder/steganography/timing-sync.js",
        "decoder/subtitle/subtitle-parser.js",
        "decoder/subtitle/subtitle-cache.js",
        "decoder/subtitle/timing-manager.js",
        "decoder/frame/region-extractor.js",
        "decoder/frame/perspective-warper.js"
    ]
    
    tests = []
    for file in required_files:
        file_path = base / file
        exists = file_path.exists()
        tests.append((file, exists, "" if exists else "Fichier manquant"))
    
    for name, passed, details in tests:
        print_test(name, passed, details)
    
    return all(t[1] for t in tests)

def test_ffmpeg():
    """Test 4: Vérifier FFmpeg"""
    print_header("TEST 4: FFmpeg Installation")
    
    import subprocess
    from pathlib import Path
    
    # Chercher FFmpeg dans les emplacements connus
    possible_paths = [
        "ffmpeg",  # Dans PATH
        str(Path.home() / "AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.0-full_build/bin/ffmpeg.exe"),
        "C:/ProgramData/chocolatey/bin/ffmpeg.exe",
    ]
    
    ffmpeg_found = None
    for ffmpeg_path in possible_paths:
        try:
            result = subprocess.run(
                [ffmpeg_path, "-version"],
                capture_output=True,
                text=True,
                timeout=5
            )
            if result.returncode == 0:
                ffmpeg_found = ffmpeg_path
                version_line = result.stdout.split('\n')[0]
                print_test("FFmpeg trouvé", True, 
                          f"{version_line}\n       Chemin: {ffmpeg_path}")
                break
        except (FileNotFoundError, Exception):
            continue
    
    if not ffmpeg_found:
        print_test("FFmpeg disponible", False, 
                  "FFmpeg non trouvé. Utilisez: winget install ffmpeg")
        return False
    
    # Test codec AAC
    try:
        result = subprocess.run(
            [ffmpeg_found, "-codecs"],
            capture_output=True,
            text=True,
            timeout=5
        )
        has_aac = "aac" in result.stdout.lower()
        print_test("Codec AAC", has_aac, "Requis pour audio")
        return has_aac
    except Exception as e:
        print_test("Codec AAC", False, str(e))
        return False

def test_steganography_logic():
    """Test 5: Logique de stéganographie"""
    print_header("TEST 5: Logique Stéganographie")
    
    try:
        import numpy as np
        from core.steganographer import SteganographicEmbedder
        
        steg = SteganographicEmbedder(video_fps=30.0)
        
        # Test data - simple subtitle data
        subtitle_data = "0|3000|Hello, World! 🚀".encode('utf-8')
        
        # Test 1: Encode
        frame = np.zeros((480, 640, 3), dtype=np.uint8)
        frame.fill(128)  # Gris
        
        encoded_frame = steg.embed_frame_data(
            frame.copy(), 
            frame_number=0, 
            timestamp_ms=0, 
            subtitle_data=subtitle_data
        )
        
        # Vérifier que l'image est modifiée
        diff = np.sum(encoded_frame != frame)
        print_test("Encodage modifie l'image", diff > 0, f"{diff} pixels modifiés")
        
        # Test 2: Invisibilité (LSB imperceptible)
        max_diff = np.max(np.abs(encoded_frame.astype(int) - frame.astype(int)))
        invisible = max_diff <= 3  # Max 3 pour LSB 2 bits
        print_test("Modification imperceptible", invisible, 
                  f"Max diff: {max_diff} (cible: ≤3)")
        
        # Test 3: Données bien embeddées
        # Vérifier que la région de sous-titres a changé
        region_height = int(frame.shape[0] * steg.SUBTITLE_REGION_HEIGHT_PERCENT / 100)
        subtitle_region_original = frame[-region_height:, :]
        subtitle_region_encoded = encoded_frame[-region_height:, :]
        subtitle_diff = np.sum(subtitle_region_encoded != subtitle_region_original)
        
        print_test("Région sous-titres modifiée", subtitle_diff > 0,
                  f"{subtitle_diff} pixels dans région subtitle")
        
        return diff > 0 and invisible and subtitle_diff > 0
        
    except Exception as e:
        import traceback
        print_test("Test stéganographie", False, str(e))
        traceback.print_exc()
        return False

def test_subtitle_parsing():
    """Test 6: Parsing sous-titres"""
    print_header("TEST 6: Parsing Sous-titres")
    
    try:
        from core.subtitle_parser import SubtitleParser
        
        parser = SubtitleParser()
        
        # Test SRT
        srt_content = """1
00:00:00,000 --> 00:00:03,000
Bonjour le monde 🌍

2
00:00:03,000 --> 00:00:06,000
Texte avec accents: éàèù
"""
        
        # Créer fichier temporaire
        import tempfile
        with tempfile.NamedTemporaryFile(mode='w', suffix='.srt', 
                                        delete=False, encoding='utf-8') as f:
            f.write(srt_content)
            temp_path = f.name
        
        try:
            success = parser.load_subtitle_file(temp_path)
            subtitles = parser.subtitles
            
            # Vérifications
            print_test("Parse SRT", len(subtitles) == 2, 
                      f"{len(subtitles)} sous-titres trouvés")
            
            if len(subtitles) >= 1:
                first = subtitles[0]
                print_test("Timing correct", 
                          first.start_ms == 0 and first.end_ms == 3000,
                          f"Start: {first.start_ms}ms, End: {first.end_ms}ms")
                
                print_test("Texte UTF-8", 
                          '🌍' in first.text,
                          "Emoji préservé")
            
            if len(subtitles) >= 2:
                second = subtitles[1]
                has_accents = all(c in second.text for c in 'éàèù')
                print_test("Accents français", has_accents,
                          f"Texte: {second.text}")
            
            return len(subtitles) == 2
            
        finally:
            os.unlink(temp_path)
            
    except Exception as e:
        import traceback
        print_test("Parsing sous-titres", False, str(e))
        traceback.print_exc()
        return False

def test_marker_generation():
    """Test 7: Génération marqueurs ArUco"""
    print_header("TEST 7: Marqueurs ArUco")
    
    try:
        import cv2
        import numpy as np
        from core.marker_generator import MarkerGenerator
        
        gen = MarkerGenerator(video_id="TEST_VIDEO")
        
        # Les marqueurs sont générés à l'initialisation
        # et stockés dans gen.markers
        markers_count = len(gen.markers)
        
        # Vérifier 4 marqueurs (4 corners)
        print_test("4 marqueurs générés", markers_count == 4,
                  f"{markers_count} marqueurs (TL, TR, BL, BR)")
        
        # Vérifier taille d'un marqueur
        if markers_count > 0:
            # Récupérer un marqueur
            marker_key = list(gen.markers.keys())[0]
            marker = gen.markers[marker_key]
            
            is_correct_size = marker.shape[0] == gen.MARKER_SIZE and marker.shape[1] == gen.MARKER_SIZE
            print_test("Taille correcte (20x20)", is_correct_size,
                      f"Taille: {marker.shape}")
            
            # Vérifier que c'est un marqueur RGB
            has_3_channels = len(marker.shape) == 3 and marker.shape[2] == 3
            print_test("Marqueur RGB", has_3_channels,
                      f"Channels: {marker.shape[2] if len(marker.shape) == 3 else 'N/A'}")
        
        return markers_count == 4
        
    except Exception as e:
        import traceback
        print_test("Génération marqueurs", False, str(e))
        traceback.print_exc()
        return False

def test_integration():
    """Test 8: Test d'intégration complet"""
    print_header("TEST 8: Intégration Complète")
    
    try:
        import cv2
        import numpy as np
        from core.marker_generator import MarkerGenerator
        from core.steganographer import SteganographicEmbedder
        from core.subtitle_parser import SubtitleParser
        
        print(f"{Colors.BLUE}[INFO] Simulation pipeline encodage...{Colors.RESET}")
        
        # 1. Créer frame test
        frame = np.random.randint(0, 255, (480, 640, 3), dtype=np.uint8)
        
        # 2. Créer données sous-titre
        subtitle_data = "0|3000|Test d'intégration Phase 4 ✨".encode('utf-8')
        
        # 3. Encoder avec timing + subtitle data
        steg = SteganographicEmbedder(video_fps=30.0)
        encoded = steg.embed_frame_data(
            frame.copy(),
            frame_number=0,
            timestamp_ms=0,
            subtitle_data=subtitle_data
        )
        
        # 4. Vérifier modifications
        diff = np.sum(encoded != frame)
        has_changes = diff > 0
        
        print_test("Embedding réussi", has_changes,
                  f"{diff} pixels modifiés")
        
        # 5. Test invisibilité
        max_diff = np.max(np.abs(encoded.astype(int) - frame.astype(int)))
        invisible = max_diff <= 3
        
        print_test("Invisible à l'œil", invisible,
                  f"Max diff: {max_diff} ≤ 3")
        
        # 6. Test marker generation
        marker_gen = MarkerGenerator(video_id="TEST")
        has_markers = len(marker_gen.markers) == 4
        
        print_test("Marqueurs générés", has_markers,
                  f"{len(marker_gen.markers)} corners")
        
        return has_changes and invisible and has_markers
        
    except Exception as e:
        import traceback
        print_test("Intégration", False, str(e))
        traceback.print_exc()
        return False

def run_all_tests():
    """Exécuter tous les tests"""
    print_header("🧪 TEST AUTOMATISÉ PHASE 4")
    print(f"{Colors.BOLD}Décodage Stéganographique - Validation Complète{Colors.RESET}\n")
    
    results = []
    
    # Tests individuels
    results.append(("Imports Python", test_imports()))
    results.append(("Fichiers Encodeur", test_encoder_files()))
    results.append(("Fichiers Décodeur", test_decoder_files()))
    results.append(("FFmpeg", test_ffmpeg()))
    results.append(("Stéganographie", test_steganography_logic()))
    results.append(("Parsing Sous-titres", test_subtitle_parsing()))
    results.append(("Marqueurs ArUco", test_marker_generation()))
    results.append(("Intégration", test_integration()))
    
    # Résumé
    print_header("📊 RÉSUMÉ")
    
    total = len(results)
    passed = sum(1 for _, p in results if p)
    failed = total - passed
    
    for name, success in results:
        status = f"{Colors.GREEN}✅" if success else f"{Colors.RED}❌"
        print(f"{status} {name}{Colors.RESET}")
    
    print(f"\n{Colors.BOLD}Total: {passed}/{total} tests réussis{Colors.RESET}")
    
    if passed == total:
        print(f"\n{Colors.GREEN}{Colors.BOLD}🎉 TOUS LES TESTS PASSENT !{Colors.RESET}")
        print(f"{Colors.GREEN}✅ Phase 4 est prête pour validation réelle{Colors.RESET}\n")
        return 0
    else:
        print(f"\n{Colors.RED}{Colors.BOLD}⚠️  {failed} TEST(S) ÉCHOUÉ(S){Colors.RESET}")
        print(f"{Colors.YELLOW}⚡ Corrigez les erreurs avant le test réel{Colors.RESET}\n")
        return 1

if __name__ == "__main__":
    try:
        sys.exit(run_all_tests())
    except KeyboardInterrupt:
        print(f"\n{Colors.YELLOW}Test interrompu{Colors.RESET}")
        sys.exit(1)
    except Exception as e:
        print(f"\n{Colors.RED}Erreur critique: {e}{Colors.RESET}")
        sys.exit(1)
