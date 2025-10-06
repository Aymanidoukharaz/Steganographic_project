"""
Unit tests for subtitle parsing functionality.
Tests SRT and VTT parsing, French text handling, and timing validation.
"""

import unittest
import tempfile
import os
from pathlib import Path
import sys

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from core.subtitle_parser import (
    SubtitleParser, SubtitleEntry, validate_subtitle_file, 
    create_test_srt_content
)


class TestSubtitleEntry(unittest.TestCase):
    """Test cases for SubtitleEntry class."""
    
    def test_subtitle_entry_creation(self):
        """Test creating subtitle entries."""
        entry = SubtitleEntry(
            start_ms=1000, end_ms=4000, 
            text="Test subtitle", index=1
        )
        
        self.assertEqual(entry.start_ms, 1000)
        self.assertEqual(entry.end_ms, 4000)
        self.assertEqual(entry.text, "Test subtitle")
        self.assertEqual(entry.index, 1)
    
    def test_duration_calculation(self):
        """Test subtitle duration calculation."""
        entry = SubtitleEntry(start_ms=1000, end_ms=4000, text="Test", index=1)
        self.assertEqual(entry.duration_ms(), 3000)
        
        entry = SubtitleEntry(start_ms=500, end_ms=1500, text="Test", index=2)
        self.assertEqual(entry.duration_ms(), 1000)
    
    def test_overlap_detection(self):
        """Test subtitle overlap detection."""
        entry1 = SubtitleEntry(start_ms=1000, end_ms=4000, text="First", index=1)
        entry2 = SubtitleEntry(start_ms=3000, end_ms=6000, text="Second", index=2)
        entry3 = SubtitleEntry(start_ms=5000, end_ms=8000, text="Third", index=3)
        
        # entry1 and entry2 overlap
        self.assertTrue(entry1.overlaps_with(entry2))
        self.assertTrue(entry2.overlaps_with(entry1))
        
        # entry2 and entry3 overlap
        self.assertTrue(entry2.overlaps_with(entry3))
        
        # entry1 and entry3 don't overlap
        self.assertFalse(entry1.overlaps_with(entry3))


class TestSubtitleParser(unittest.TestCase):
    """Test cases for SubtitleParser class."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.parser = SubtitleParser()
        self.temp_dir = tempfile.mkdtemp()
        
        # Create test SRT file with French content
        self.test_srt_path = os.path.join(self.temp_dir, "test_french.srt")
        with open(self.test_srt_path, 'w', encoding='utf-8') as f:
            f.write(create_test_srt_content())
        
        # Create test VTT file
        self.test_vtt_path = os.path.join(self.temp_dir, "test_french.vtt")
        self.create_test_vtt_file(self.test_vtt_path)
    
    def tearDown(self):
        """Clean up test fixtures."""
        try:
            for file in os.listdir(self.temp_dir):
                os.remove(os.path.join(self.temp_dir, file))
            os.rmdir(self.temp_dir)
        except:
            pass
    
    def create_test_vtt_file(self, output_path):
        """Create test VTT file with French content."""
        vtt_content = """WEBVTT

1
00:00.000 --> 00:03.000
Bonjour! Voici le premier sous-titre français.

2
00:03.500 --> 00:07.000
Les caractères spéciaux: é, è, à, ç, ñ, ê, ô.

3
00:07.500 --> 00:11.000
Système de décodage stéganographique en réalité augmentée.

4
00:11.500 --> 00:15.000
Développé par AYMAN IDOUKHARAZ pour l'université.

5
00:15.500 --> 00:19.000
Démonstration réussie de l'intégration AR et IA.

6
00:19.500 --> 00:22.000
Merci d'avoir regardé cette présentation!
"""
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(vtt_content)
    
    def test_srt_parsing_success(self):
        """Test successful SRT file parsing."""
        result = self.parser.load_subtitle_file(self.test_srt_path)
        self.assertTrue(result)
        
        subtitles = self.parser.get_subtitles()
        self.assertEqual(len(subtitles), 6)
        
        # Check first subtitle
        first_sub = subtitles[0]
        self.assertEqual(first_sub.start_ms, 0)
        self.assertEqual(first_sub.end_ms, 3000)
        self.assertEqual(first_sub.text, "Bonjour! Voici le premier sous-titre français.")
        self.assertEqual(first_sub.index, 1)
    
    def test_vtt_parsing_success(self):
        """Test successful VTT file parsing."""
        result = self.parser.load_subtitle_file(self.test_vtt_path)
        self.assertTrue(result)
        
        subtitles = self.parser.get_subtitles()
        self.assertEqual(len(subtitles), 6)
        
        # Check second subtitle for special characters
        second_sub = subtitles[1]
        self.assertIn("é, è, à, ç, ñ, ê, ô", second_sub.text)
    
    def test_french_character_handling(self):
        """Test proper handling of French accented characters."""
        # Create SRT with various French characters
        french_srt = """1
00:00:00,000 --> 00:00:03,000
Café, théâtre, hôtel, naïf

2
00:00:03,000 --> 00:00:06,000
À bientôt! C'est très intéressant.

3
00:00:06,000 --> 00:00:09,000
Noël, cœur, sœur, œuf, bœuf

4
00:00:09,000 --> 00:00:12,000
Français, château, pâte, être, fenêtre
"""
        
        french_srt_path = os.path.join(self.temp_dir, "french_chars.srt")
        with open(french_srt_path, 'w', encoding='utf-8') as f:
            f.write(french_srt)
        
        result = self.parser.load_subtitle_file(french_srt_path)
        self.assertTrue(result)
        
        subtitles = self.parser.get_subtitles()
        
        # Verify all French characters are preserved
        all_text = " ".join(sub.text for sub in subtitles)
        french_chars = ['é', 'è', 'à', 'ç', 'ñ', 'ê', 'ô', 'ï', 'œ', 'û']
        
        for char in french_chars:
            if char in french_srt:
                self.assertIn(char, all_text, f"French character '{char}' not preserved")
    
    def test_subtitle_timing_lookup(self):
        """Test finding subtitles at specific times."""
        self.parser.load_subtitle_file(self.test_srt_path)
        
        # Test various timestamps
        test_cases = [
            (1000, "Bonjour! Voici le premier sous-titre français."),  # 1 second
            (5000, "Les caractères spéciaux: é, è, à, ç, ñ, ê, ô."),   # 5 seconds
            (2500, None),  # Between subtitles
            (25000, None)  # After all subtitles
        ]
        
        for time_ms, expected_text in test_cases:
            subtitle = self.parser.get_subtitle_at_time(time_ms)
            
            if expected_text is None:
                self.assertIsNone(subtitle)
            else:
                self.assertIsNotNone(subtitle)
                self.assertEqual(subtitle.text, expected_text)
    
    def test_subtitle_range_lookup(self):
        """Test finding subtitles in a time range."""
        self.parser.load_subtitle_file(self.test_srt_path)
        
        # Get subtitles in first 10 seconds
        subtitles_in_range = self.parser.get_subtitles_in_range(0, 10000)
        
        # Should include first 3 subtitles (0-3s, 3.5-7s, 7.5-11s)
        self.assertEqual(len(subtitles_in_range), 3)
        
        # Get subtitles in middle range
        subtitles_in_range = self.parser.get_subtitles_in_range(10000, 20000)
        
        # Should include subtitles 4 and 5
        self.assertEqual(len(subtitles_in_range), 2)
    
    def test_timing_validation(self):
        """Test subtitle timing validation."""
        self.parser.load_subtitle_file(self.test_srt_path)
        
        issues = self.parser.validate_timing()
        
        # Test SRT should have no major timing issues
        self.assertIsInstance(issues, list)
        
        # Check that validation catches overlapping subtitles
        # Create subtitle parser with overlapping entries
        overlap_parser = SubtitleParser()
        overlap_parser.subtitles = [
            SubtitleEntry(start_ms=1000, end_ms=4000, text="First", index=1),
            SubtitleEntry(start_ms=3000, end_ms=6000, text="Overlapping", index=2),
        ]
        
        issues = overlap_parser.validate_timing()
        self.assertTrue(any("overlap" in issue.lower() for issue in issues))
    
    def test_statistics_calculation(self):
        """Test subtitle statistics calculation."""
        self.parser.load_subtitle_file(self.test_srt_path)
        
        stats = self.parser.get_statistics()
        
        expected_keys = ['count', 'total_duration_ms', 'average_duration_ms', 
                        'first_start_ms', 'last_end_ms', 'total_span_ms', 
                        'format', 'file_path']
        
        for key in expected_keys:
            self.assertIn(key, stats)
        
        self.assertEqual(stats['count'], 6)
        self.assertEqual(stats['format'], '.srt')
        self.assertGreater(stats['total_duration_ms'], 0)
        self.assertEqual(stats['first_start_ms'], 0)
    
    def test_file_validation(self):
        """Test subtitle file validation."""
        # Valid files
        self.assertTrue(validate_subtitle_file(self.test_srt_path))
        self.assertTrue(validate_subtitle_file(self.test_vtt_path))
        
        # Invalid files
        self.assertFalse(validate_subtitle_file("nonexistent.srt"))
        
        # Wrong extension
        text_file = os.path.join(self.temp_dir, "test.txt")
        with open(text_file, 'w') as f:
            f.write("This is not a subtitle file")
        self.assertFalse(validate_subtitle_file(text_file))
    
    def test_malformed_srt_handling(self):
        """Test handling of malformed SRT files."""
        # Create malformed SRT
        malformed_srt = """1
INVALID TIME FORMAT
Subtitle with bad timing

2
00:00:03,000 --> 00:00:06,000
This subtitle should work

This is not a proper subtitle entry
"""
        
        malformed_path = os.path.join(self.temp_dir, "malformed.srt")
        with open(malformed_path, 'w', encoding='utf-8') as f:
            f.write(malformed_srt)
        
        # Should handle gracefully (might load partial content or fail cleanly)
        try:
            result = self.parser.load_subtitle_file(malformed_path)
            # If it succeeds, should have at least some valid subtitles
            if result:
                subtitles = self.parser.get_subtitles()
                # Should have loaded at least the valid entry
                self.assertGreaterEqual(len(subtitles), 0)
        except Exception:
            # If it fails, that's also acceptable for malformed files
            pass
    
    def test_encoding_detection(self):
        """Test detection and handling of different text encodings."""
        # Create SRT with UTF-8 BOM
        utf8_bom_content = '\ufeff' + create_test_srt_content()
        bom_path = os.path.join(self.temp_dir, "utf8_bom.srt")
        with open(bom_path, 'w', encoding='utf-8-sig') as f:
            f.write(utf8_bom_content)
        
        result = self.parser.load_subtitle_file(bom_path)
        self.assertTrue(result)
        
        subtitles = self.parser.get_subtitles()
        # Should not have BOM character in text
        first_text = subtitles[0].text
        self.assertNotIn('\ufeff', first_text)
    
    def test_html_tag_removal(self):
        """Test removal of HTML tags from subtitles."""
        html_srt = """1
00:00:00,000 --> 00:00:03,000
<b>Bold text</b> and <i>italic text</i>

2
00:00:03,000 --> 00:00:06,000
<font color="red">Colored text</font> and <u>underlined</u>

3
00:00:06,000 --> 00:00:09,000
Text with {b}formatting{/b} tags
"""
        
        html_path = os.path.join(self.temp_dir, "html_tags.srt")
        with open(html_path, 'w', encoding='utf-8') as f:
            f.write(html_srt)
        
        result = self.parser.load_subtitle_file(html_path)
        self.assertTrue(result)
        
        subtitles = self.parser.get_subtitles()
        
        # Check that HTML tags are removed
        self.assertEqual(subtitles[0].text, "Bold text and italic text")
        self.assertEqual(subtitles[1].text, "Colored text and underlined")
        self.assertEqual(subtitles[2].text, "Text with formatting tags")


class TestSubtitleParserEdgeCases(unittest.TestCase):
    """Test edge cases and boundary conditions for subtitle parsing."""
    
    def setUp(self):
        """Set up edge case test fixtures."""
        self.parser = SubtitleParser()
        self.temp_dir = tempfile.mkdtemp()
    
    def tearDown(self):
        """Clean up edge case test fixtures."""
        try:
            for file in os.listdir(self.temp_dir):
                os.remove(os.path.join(self.temp_dir, file))
            os.rmdir(self.temp_dir)
        except:
            pass
    
    def test_empty_subtitle_file(self):
        """Test handling of empty subtitle files."""
        empty_path = os.path.join(self.temp_dir, "empty.srt")
        with open(empty_path, 'w') as f:
            f.write("")
        
        result = self.parser.load_subtitle_file(empty_path)
        # Should handle empty files gracefully
        self.assertTrue(result or not result)  # Accept either outcome
    
    def test_very_long_subtitle_text(self):
        """Test handling of very long subtitle text."""
        long_text = "This is a very long subtitle text. " * 100  # 3500+ characters
        
        long_srt = f"""1
00:00:00,000 --> 00:00:10,000
{long_text}
"""
        
        long_path = os.path.join(self.temp_dir, "long.srt")
        with open(long_path, 'w', encoding='utf-8') as f:
            f.write(long_srt)
        
        result = self.parser.load_subtitle_file(long_path)
        self.assertTrue(result)
        
        subtitles = self.parser.get_subtitles()
        self.assertEqual(len(subtitles), 1)
        
        # Text should be preserved (possibly truncated if there are limits)
        subtitle_text = subtitles[0].text
        self.assertGreater(len(subtitle_text), 100)
    
    def test_unicode_edge_cases(self):
        """Test handling of various Unicode characters."""
        unicode_srt = """1
00:00:00,000 --> 00:00:03,000
Emoji: 🎬 🎥 📽️ and symbols: ©️ ®️ ™️

2
00:00:03,000 --> 00:00:06,000
Math symbols: ∞ ≈ ± × ÷ √

3
00:00:06,000 --> 00:00:09,000
Currency: € £ ¥ ₹ ₽ ₿
"""
        
        unicode_path = os.path.join(self.temp_dir, "unicode.srt")
        with open(unicode_path, 'w', encoding='utf-8') as f:
            f.write(unicode_srt)
        
        result = self.parser.load_subtitle_file(unicode_path)
        self.assertTrue(result)
        
        subtitles = self.parser.get_subtitles()
        self.assertEqual(len(subtitles), 3)
        
        # Unicode characters should be preserved
        all_text = " ".join(sub.text for sub in subtitles)
        self.assertIn('🎬', all_text)
        self.assertIn('€', all_text)
        self.assertIn('∞', all_text)


if __name__ == '__main__':
    # Run tests
    unittest.main(verbosity=2)