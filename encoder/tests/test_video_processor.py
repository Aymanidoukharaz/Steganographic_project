"""
Unit tests for video processor module.
Tests video loading, frame extraction, and video saving functionality.
"""

import unittest
import tempfile
import os
import numpy as np
import cv2
from pathlib import Path
import sys

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from core.video_processor import VideoProcessor, validate_video_file, get_video_duration


class TestVideoProcessor(unittest.TestCase):
    """Test cases for VideoProcessor class."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.processor = VideoProcessor()
        self.temp_dir = tempfile.mkdtemp()
        
        # Create a test video file
        self.test_video_path = os.path.join(self.temp_dir, "test_video.mp4")
        self.create_test_video(self.test_video_path)
    
    def tearDown(self):
        """Clean up test fixtures."""
        self.processor.cleanup()
        
        # Clean up temp files
        try:
            if os.path.exists(self.test_video_path):
                os.remove(self.test_video_path)
            os.rmdir(self.temp_dir)
        except:
            pass
    
    def create_test_video(self, output_path, width=640, height=480, fps=30, duration_sec=2):
        """Create a simple test video file."""
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        writer = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
        
        total_frames = int(fps * duration_sec)
        
        for i in range(total_frames):
            # Create a simple test frame with changing colors
            frame = np.zeros((height, width, 3), dtype=np.uint8)
            
            # Add some pattern to make frames different
            color_value = int((i / total_frames) * 255)
            frame[:, :] = [color_value, 255 - color_value, 128]
            
            # Add frame number text
            cv2.putText(frame, f"Frame {i}", (10, 30), 
                       cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
            
            writer.write(frame)
        
        writer.release()
    
    def test_video_loading_success(self):
        """Test successful video loading."""
        result = self.processor.load_video(self.test_video_path)
        self.assertTrue(result)
        
        info = self.processor.get_video_info()
        self.assertEqual(info['width'], 640)
        self.assertEqual(info['height'], 480)
        self.assertAlmostEqual(info['fps'], 30.0, places=1)
        self.assertGreater(info['total_frames'], 0)
    
    def test_video_loading_nonexistent_file(self):
        """Test loading non-existent file."""
        result = self.processor.load_video("nonexistent_file.mp4")
        self.assertFalse(result)
    
    def test_video_loading_unsupported_format(self):
        """Test loading unsupported file format."""
        # Create a text file with video extension
        fake_video = os.path.join(self.temp_dir, "fake.mp4")
        with open(fake_video, 'w') as f:
            f.write("This is not a video file")
        
        result = self.processor.load_video(fake_video)
        self.assertFalse(result)
    
    def test_frame_extraction(self):
        """Test frame extraction from video."""
        self.processor.load_video(self.test_video_path)
        
        progress_updates = []
        def progress_callback(progress):
            progress_updates.append(progress)
        
        frames = self.processor.extract_frames(progress_callback)
        
        self.assertGreater(len(frames), 0)
        self.assertTrue(all(isinstance(frame, np.ndarray) for frame in frames))
        self.assertTrue(len(progress_updates) > 0)
        
        # Check frame dimensions
        first_frame = frames[0]
        self.assertEqual(first_frame.shape[:2], (480, 640))  # height, width
    
    def test_video_saving(self):
        """Test saving frames as video."""
        # Load test video and extract frames
        self.processor.load_video(self.test_video_path)
        frames = self.processor.extract_frames()
        
        # Save frames as new video
        output_path = os.path.join(self.temp_dir, "output_video.mp4")
        
        progress_updates = []
        def progress_callback(progress):
            progress_updates.append(progress)
        
        result = self.processor.save_frames_as_video(frames, output_path, progress_callback)
        self.assertTrue(result)
        self.assertTrue(os.path.exists(output_path))
        self.assertTrue(len(progress_updates) > 0)
        
        # Verify saved video can be loaded
        new_processor = VideoProcessor()
        load_result = new_processor.load_video(output_path)
        self.assertTrue(load_result)
        
        new_info = new_processor.get_video_info()
        self.assertEqual(new_info['width'], 640)
        self.assertEqual(new_info['height'], 480)
        
        new_processor.cleanup()
    
    def test_validate_video_file(self):
        """Test video file validation."""
        # Valid video file
        self.assertTrue(validate_video_file(self.test_video_path))
        
        # Non-existent file
        self.assertFalse(validate_video_file("nonexistent.mp4"))
        
        # Invalid extension
        text_file = os.path.join(self.temp_dir, "test.txt")
        with open(text_file, 'w') as f:
            f.write("test")
        self.assertFalse(validate_video_file(text_file))
    
    def test_get_video_duration(self):
        """Test video duration calculation."""
        duration = get_video_duration(self.test_video_path)
        self.assertAlmostEqual(duration, 2.0, places=1)  # 2 second test video
        
        # Non-existent file
        duration = get_video_duration("nonexistent.mp4")
        self.assertEqual(duration, 0.0)
    
    def test_capacity_validation(self):
        """Test video capacity validation for embedding."""
        self.processor.load_video(self.test_video_path)
        info = self.processor.get_video_info()
        
        # Should have sufficient capacity for test video
        from core.steganographer import SteganographicEmbedder
        embedder = SteganographicEmbedder(info['fps'])
        
        capacity_valid = embedder.validate_embedding_capacity(info['width'], info['height'])
        self.assertTrue(capacity_valid)
        
        capacity_info = embedder.estimate_capacity(info['width'], info['height'])
        self.assertGreater(capacity_info['total_capacity_bytes'], 0)


class TestVideoProcessorIntegration(unittest.TestCase):
    """Integration tests for video processor with real video operations."""
    
    def setUp(self):
        """Set up integration test fixtures."""
        self.temp_dir = tempfile.mkdtemp()
    
    def tearDown(self):
        """Clean up integration test fixtures."""
        try:
            for file in os.listdir(self.temp_dir):
                os.remove(os.path.join(self.temp_dir, file))
            os.rmdir(self.temp_dir)
        except:
            pass
    
    def test_end_to_end_video_processing(self):
        """Test complete video processing pipeline."""
        # Create test video
        input_video = os.path.join(self.temp_dir, "input.mp4")
        self.create_colorful_test_video(input_video)
        
        # Process video
        processor = VideoProcessor()
        
        # Load video
        load_success = processor.load_video(input_video)
        self.assertTrue(load_success)
        
        # Extract frames
        frames = processor.extract_frames()
        self.assertGreater(len(frames), 0)
        
        # Modify frames (simple processing)
        processed_frames = []
        for frame in frames:
            # Add a simple overlay to each frame
            modified = frame.copy()
            cv2.rectangle(modified, (10, 10), (50, 50), (0, 255, 0), -1)
            processed_frames.append(modified)
        
        # Save processed video
        output_video = os.path.join(self.temp_dir, "processed.mp4")
        save_success = processor.save_frames_as_video(processed_frames, output_video)
        self.assertTrue(save_success)
        
        # Verify output
        self.assertTrue(os.path.exists(output_video))
        self.assertGreater(os.path.getsize(output_video), 1000)  # Should be reasonable size
        
        # Verify output can be loaded
        output_processor = VideoProcessor()
        verify_success = output_processor.load_video(output_video)
        self.assertTrue(verify_success)
        
        output_info = output_processor.get_video_info()
        input_info = processor.get_video_info()
        
        # Dimensions should match
        self.assertEqual(output_info['width'], input_info['width'])
        self.assertEqual(output_info['height'], input_info['height'])
        
        processor.cleanup()
        output_processor.cleanup()
    
    def create_colorful_test_video(self, output_path, width=720, height=480, fps=30, duration_sec=1):
        """Create a more complex test video with various patterns."""
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        writer = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
        
        total_frames = int(fps * duration_sec)
        
        for i in range(total_frames):
            frame = np.zeros((height, width, 3), dtype=np.uint8)
            
            # Create gradient pattern
            for y in range(height):
                for x in range(width):
                    r = int((x / width) * 255)
                    g = int((y / height) * 255) 
                    b = int(((x + y) / (width + height)) * 255)
                    frame[y, x] = [b, g, r]  # BGR format
            
            # Add moving circle
            center_x = int((i / total_frames) * width)
            center_y = height // 2
            cv2.circle(frame, (center_x, center_y), 30, (255, 255, 255), -1)
            
            writer.write(frame)
        
        writer.release()


if __name__ == '__main__':
    # Run tests
    unittest.main(verbosity=2)