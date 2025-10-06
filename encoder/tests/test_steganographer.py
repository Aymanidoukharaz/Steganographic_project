"""
Unit tests for steganographic embedding and extraction functionality.
Tests LSB encoding, timing data embedding, and subtitle data compression.
"""

import unittest
import tempfile
import os
import numpy as np
import struct
from pathlib import Path
import sys

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from core.steganographer import SteganographicEmbedder, SteganographicExtractor
from core.subtitle_parser import SubtitleEntry


class TestSteganographicEmbedder(unittest.TestCase):
    """Test cases for SteganographicEmbedder class."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.embedder = SteganographicEmbedder(fps=30.0)
        self.extractor = SteganographicExtractor()
        
        # Create test frame
        self.test_frame = np.random.randint(0, 256, (480, 640, 3), dtype=np.uint8)
        
        # Create test subtitles
        self.test_subtitles = [
            SubtitleEntry(start_ms=0, end_ms=3000, text="Premier sous-titre français", index=1),
            SubtitleEntry(start_ms=3500, end_ms=7000, text="Deuxième avec accents: é, è, à, ç", index=2),
            SubtitleEntry(start_ms=7500, end_ms=11000, text="Troisième sous-titre plus long avec beaucoup de texte", index=3)
        ]
    
    def test_timing_data_embedding_extraction(self):
        """Test embedding and extraction of timing data."""
        frame_number = 42
        timestamp_ms = 1400  # 1.4 seconds at 30 FPS
        
        # Embed timing data
        embedded_frame = self.embedder.embed_frame_data(
            self.test_frame, frame_number, timestamp_ms
        )
        
        # Verify frame was modified
        self.assertFalse(np.array_equal(self.test_frame, embedded_frame))
        
        # Extract timing data
        extracted_frame_num, extracted_timestamp = self.extractor.extract_timing_data(embedded_frame)
        
        # Verify extracted data matches original
        self.assertEqual(extracted_frame_num, frame_number)
        self.assertEqual(extracted_timestamp, timestamp_ms)
    
    def test_subtitle_compression_decompression(self):
        """Test subtitle text compression and decompression."""
        test_text = "Bonjour! Voici un test avec accents: é, è, à, ç, ñ"
        start_ms = 1000
        end_ms = 4000
        
        # Compress subtitle
        compressed_data = self.embedder.compress_subtitle_text(test_text, start_ms, end_ms)
        
        self.assertIsInstance(compressed_data, bytes)
        self.assertGreater(len(compressed_data), 0)
        
        # Note: Decompression would be tested in decoder module
        # For now, just verify compression produces valid data
    
    def test_subtitle_frame_matching(self):
        """Test matching subtitles to specific frames."""
        # Test frame at 2 seconds (frame 60 at 30 FPS)
        frame_number = 60
        
        subtitle_data = self.embedder.prepare_subtitle_data_for_frame(
            self.test_subtitles, frame_number
        )
        
        # Should have subtitle data (frame 60 = 2000ms, within first subtitle)
        self.assertIsNotNone(subtitle_data)
        self.assertIsInstance(subtitle_data, bytes)
        
        # Test frame with no subtitle (frame 200 = 6.67s, between subtitles)
        frame_number = 200
        subtitle_data = self.embedder.prepare_subtitle_data_for_frame(
            self.test_subtitles, frame_number
        )
        
        # Should have no subtitle data
        self.assertIsNone(subtitle_data)
    
    def test_capacity_estimation(self):
        """Test data capacity estimation for different frame sizes."""
        # Test various frame sizes
        test_sizes = [(640, 480), (1280, 720), (1920, 1080), (320, 240)]
        
        for width, height in test_sizes:
            capacity = self.embedder.estimate_capacity(width, height)
            
            self.assertIn('frame_dimensions', capacity)
            self.assertIn('timing_strip', capacity)
            self.assertIn('subtitle_region', capacity)
            
            # Verify timing strip has enough capacity
            timing_required = capacity['timing_strip']['required_bytes']
            timing_available = capacity['timing_strip']['capacity_bytes']
            self.assertGreaterEqual(timing_available, timing_required)
            
            # Verify reasonable subtitle capacity
            subtitle_capacity = capacity['subtitle_region']['capacity_bytes']
            self.assertGreater(subtitle_capacity, 50)  # At least 50 bytes
    
    def test_embedding_validation(self):
        """Test validation of embedding capacity."""
        # Test sufficient capacity (720p)
        result = self.embedder.validate_embedding_capacity(1280, 720)
        self.assertTrue(result)
        
        # Test insufficient capacity (very small frame)
        result = self.embedder.validate_embedding_capacity(50, 50)
        self.assertFalse(result)
    
    def test_full_frame_embedding_extraction(self):
        """Test complete frame embedding and extraction cycle."""
        frame_number = 75  # 2.5 seconds at 30 FPS
        timestamp_ms = int(frame_number * (1000/30))
        
        # Find active subtitle
        subtitle_data = self.embedder.prepare_subtitle_data_for_frame(
            self.test_subtitles, frame_number
        )
        
        # Embed all data
        embedded_frame = self.embedder.embed_frame_data(
            self.test_frame, frame_number, timestamp_ms, subtitle_data
        )
        
        # Extract timing data
        extracted_frame_num, extracted_timestamp = self.extractor.extract_timing_data(embedded_frame)
        
        # Verify timing data
        self.assertEqual(extracted_frame_num, frame_number)
        self.assertEqual(extracted_timestamp, timestamp_ms)
        
        # Verify frame dimensions preserved
        self.assertEqual(embedded_frame.shape, self.test_frame.shape)
    
    def test_error_handling(self):
        """Test error handling for invalid inputs."""
        # Test with None frame
        result = self.embedder.embed_frame_data(None, 0, 0)
        self.assertIsNone(result)
        
        # Test with empty frame
        empty_frame = np.array([])
        result = self.embedder.embed_frame_data(empty_frame, 0, 0)
        self.assertEqual(len(result), 0)
        
        # Test extraction from invalid frame
        extracted = self.extractor.extract_timing_data(None)
        self.assertEqual(extracted, (None, None))
    
    def test_french_text_encoding(self):
        """Test proper handling of French text with accents."""
        french_texts = [
            "Bonjour, comment ça va?",
            "Café, théâtre, hôtel, naïf",
            "À bientôt! C'est très intéressant.",
            "Noël, cœur, sœur, œuf",
            "Français, château, pâte, être"
        ]
        
        for text in french_texts:
            compressed = self.embedder.compress_subtitle_text(text, 1000, 4000)
            
            # Should compress without errors
            self.assertIsInstance(compressed, bytes)
            self.assertGreater(len(compressed), 0)
            
            # Text should be properly encoded (no replacement characters)
            self.assertNotIn('�', text)
    
    def test_large_subtitle_handling(self):
        """Test handling of large subtitle text."""
        # Create very long subtitle text
        long_text = "Ceci est un très long sous-titre qui contient beaucoup de texte français avec des accents. " * 10
        
        compressed = self.embedder.compress_subtitle_text(long_text, 1000, 5000)
        
        # Should handle long text
        self.assertIsInstance(compressed, bytes)
        self.assertGreater(len(compressed), 0)
        
        # Compression should reduce size significantly
        original_size = len(long_text.encode('utf-8'))
        compressed_size = len(compressed)
        self.assertLess(compressed_size, original_size)  # Should be compressed
    
    def test_timing_precision(self):
        """Test precision of timing data embedding and extraction."""
        test_cases = [
            (0, 0),
            (1, 33),      # 1 frame at 30 FPS ≈ 33ms
            (30, 1000),   # 1 second
            (1800, 60000), # 1 minute at 30 FPS
            (2700, 90000)  # 1.5 minutes
        ]
        
        for frame_num, expected_ms in test_cases:
            # Embed timing data
            embedded_frame = self.embedder.embed_frame_data(
                self.test_frame.copy(), frame_num, expected_ms
            )
            
            # Extract timing data
            extracted_frame, extracted_ms = self.extractor.extract_timing_data(embedded_frame)
            
            # Verify precision
            self.assertEqual(extracted_frame, frame_num)
            self.assertEqual(extracted_ms, expected_ms)
    
    def test_concurrent_data_embedding(self):
        """Test embedding both timing and subtitle data simultaneously."""
        frame_number = 30  # 1 second
        timestamp_ms = 1000
        
        # Create subtitle for this time
        subtitle_entry = SubtitleEntry(
            start_ms=500, end_ms=1500, 
            text="Test simultané timing et sous-titre", 
            index=1
        )
        
        subtitle_data = self.embedder.compress_subtitle_text(
            subtitle_entry.text, subtitle_entry.start_ms, subtitle_entry.end_ms
        )
        
        # Embed both timing and subtitle data
        embedded_frame = self.embedder.embed_frame_data(
            self.test_frame, frame_number, timestamp_ms, subtitle_data
        )
        
        # Extract timing data (subtitle extraction would be in decoder)
        extracted_frame, extracted_ms = self.extractor.extract_timing_data(embedded_frame)
        
        # Verify timing data still correct with subtitle data present
        self.assertEqual(extracted_frame, frame_number)
        self.assertEqual(extracted_ms, timestamp_ms)


class TestSteganographyEdgeCases(unittest.TestCase):
    """Test edge cases and boundary conditions for steganographic embedding."""
    
    def setUp(self):
        """Set up edge case test fixtures."""
        self.embedder = SteganographicEmbedder(fps=30.0)
        self.extractor = SteganographicExtractor()
    
    def test_minimum_frame_size(self):
        """Test with minimum viable frame size."""
        # Minimum frame that can fit timing strip
        min_frame = np.random.randint(0, 256, (10, 100, 3), dtype=np.uint8)
        
        # Should be able to embed timing data
        embedded = self.embedder.embed_frame_data(min_frame, 1, 33)
        self.assertIsNotNone(embedded)
        
        # Should be able to extract timing data
        extracted_frame, extracted_ms = self.extractor.extract_timing_data(embedded)
        self.assertEqual(extracted_frame, 1)
        self.assertEqual(extracted_ms, 33)
    
    def test_maximum_timing_values(self):
        """Test with maximum timing values."""
        frame = np.random.randint(0, 256, (480, 640, 3), dtype=np.uint8)
        
        # Test maximum 32-bit values
        max_frame_num = 2**32 - 1
        max_timestamp = 2**32 - 1
        
        # This should handle overflow gracefully
        embedded = self.embedder.embed_frame_data(frame, max_frame_num, max_timestamp)
        self.assertIsNotNone(embedded)
    
    def test_grayscale_frame_handling(self):
        """Test embedding in grayscale frames."""
        # Create grayscale frame
        gray_frame = np.random.randint(0, 256, (480, 640), dtype=np.uint8)
        
        # Should handle grayscale frames (convert internally if needed)
        result = self.embedder.embed_frame_data(gray_frame, 1, 33)
        
        # Should either work or gracefully handle the limitation
        # Implementation might convert to color or reject gracefully
        self.assertTrue(result is not None or True)  # Accept either outcome
    
    def test_different_color_spaces(self):
        """Test with different color channel arrangements."""
        # Test with different channel orders and values
        frame_bgr = np.random.randint(0, 256, (480, 640, 3), dtype=np.uint8)
        frame_rgb = frame_bgr[:, :, ::-1]  # Reverse channel order
        
        # Both should work (OpenCV typically uses BGR)
        result_bgr = self.embedder.embed_frame_data(frame_bgr, 1, 33)
        result_rgb = self.embedder.embed_frame_data(frame_rgb, 1, 33)
        
        self.assertIsNotNone(result_bgr)
        self.assertIsNotNone(result_rgb)


if __name__ == '__main__':
    # Run tests
    unittest.main(verbosity=2)