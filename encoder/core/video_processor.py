"""
Video processing module for loading, processing, and saving video files.
Handles MP4, AVI, MOV formats with H.264 output codec.
"""

import cv2
import numpy as np
import os
from typing import Tuple, List, Optional, Callable
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class VideoProcessor:
    """Handles video file loading, frame extraction, and saving."""
    
    SUPPORTED_FORMATS = ['.mp4', '.avi', '.mov']
    OUTPUT_CODEC = 'mp4v'  # Use mp4v for better compatibility
    
    def __init__(self):
        self.video_path = None
        self.output_path = None
        self.cap = None
        self.writer = None
        self.total_frames = 0
        self.fps = 30.0
        self.frame_size = (1280, 720)
        
    def load_video(self, video_path: str) -> bool:
        """
        Load video file and extract metadata.
        
        Args:
            video_path: Path to input video file
            
        Returns:
            bool: True if video loaded successfully, False otherwise
        """
        if not os.path.exists(video_path):
            logger.error(f"Video file not found: {video_path}")
            return False
            
        # Check file extension
        file_ext = os.path.splitext(video_path)[1].lower()
        if file_ext not in self.SUPPORTED_FORMATS:
            logger.error(f"Unsupported video format: {file_ext}")
            return False
            
        try:
            self.cap = cv2.VideoCapture(video_path)
            if not self.cap.isOpened():
                logger.error(f"Could not open video file: {video_path}")
                return False
                
            # Extract video metadata
            self.total_frames = int(self.cap.get(cv2.CAP_PROP_FRAME_COUNT))
            self.fps = self.cap.get(cv2.CAP_PROP_FPS)
            width = int(self.cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(self.cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            self.frame_size = (width, height)
            
            self.video_path = video_path
            
            logger.info(f"Video loaded: {width}x{height}, {self.fps} FPS, {self.total_frames} frames")
            return True
            
        except Exception as e:
            logger.error(f"Error loading video: {str(e)}")
            return False
    
    def get_video_info(self) -> dict:
        """
        Get video metadata information.
        
        Returns:
            dict: Video information including dimensions, FPS, frame count
        """
        if not self.cap:
            return {}
            
        return {
            'width': self.frame_size[0],
            'height': self.frame_size[1],
            'fps': self.fps,
            'total_frames': self.total_frames,
            'duration': self.total_frames / self.fps if self.fps > 0 else 0
        }
    
    def extract_frames(self, progress_callback: Optional[Callable[[float], None]] = None) -> List[np.ndarray]:
        """
        Extract all frames from the video.
        
        Args:
            progress_callback: Optional callback function for progress updates (0.0 to 1.0)
            
        Returns:
            List[np.ndarray]: List of video frames as numpy arrays
        """
        if not self.cap:
            logger.error("No video loaded")
            return []
            
        frames = []
        frame_count = 0
        
        try:
            self.cap.set(cv2.CAP_PROP_POS_FRAMES, 0)  # Reset to beginning
            
            while True:
                ret, frame = self.cap.read()
                if not ret:
                    break
                    
                frames.append(frame.copy())
                frame_count += 1
                
                # Report progress
                if progress_callback and self.total_frames > 0:
                    progress = frame_count / self.total_frames
                    progress_callback(progress * 0.3)  # Use 30% for extraction
                    
            logger.info(f"Extracted {len(frames)} frames from video")
            return frames
            
        except Exception as e:
            logger.error(f"Error extracting frames: {str(e)}")
            return []
    
    def setup_video_writer(self, output_path: str, frame_size: Optional[Tuple[int, int]] = None) -> bool:
        """
        Set up video writer for output.
        
        Args:
            output_path: Path for output video file
            frame_size: Optional frame size override
            
        Returns:
            bool: True if writer setup successfully, False otherwise
        """
        try:
            self.output_path = output_path
            if frame_size:
                self.frame_size = frame_size
                
            # Use mp4v codec for better compatibility
            fourcc = cv2.VideoWriter_fourcc(*self.OUTPUT_CODEC)
            self.writer = cv2.VideoWriter(
                output_path,
                fourcc,
                self.fps,
                self.frame_size
            )
            
            if not self.writer.isOpened():
                logger.error("Could not open video writer")
                return False
                
            logger.info(f"Video writer setup: {output_path}, {self.frame_size}, {self.fps} FPS")
            return True
            
        except Exception as e:
            logger.error(f"Error setting up video writer: {str(e)}")
            return False
    
    def write_frame(self, frame: np.ndarray) -> bool:
        """
        Write a single frame to output video.
        
        Args:
            frame: Frame to write as numpy array
            
        Returns:
            bool: True if frame written successfully, False otherwise
        """
        if not self.writer:
            logger.error("Video writer not initialized")
            return False
            
        try:
            # Ensure frame is the correct size
            if frame.shape[:2][::-1] != self.frame_size:
                frame = cv2.resize(frame, self.frame_size)
                
            self.writer.write(frame)
            return True
            
        except Exception as e:
            logger.error(f"Error writing frame: {str(e)}")
            return False
    
    def save_frames_as_video(self, frames: List[np.ndarray], output_path: str, 
                           progress_callback: Optional[Callable[[float], None]] = None) -> bool:
        """
        Save a list of frames as a video file.
        
        Args:
            frames: List of frames to save
            output_path: Output video file path
            progress_callback: Optional callback for progress updates
            
        Returns:
            bool: True if video saved successfully, False otherwise
        """
        if not frames:
            logger.error("No frames to save")
            return False
            
        try:
            # Setup writer based on first frame
            first_frame = frames[0]
            frame_height, frame_width = first_frame.shape[:2]
            
            if not self.setup_video_writer(output_path, (frame_width, frame_height)):
                return False
            
            # Write all frames
            total_frames = len(frames)
            for i, frame in enumerate(frames):
                if not self.write_frame(frame):
                    logger.error(f"Failed to write frame {i}")
                    return False
                    
                # Report progress
                if progress_callback:
                    progress = 0.7 + (i + 1) / total_frames * 0.3  # 70-100% for saving
                    progress_callback(progress)
            
            self.finalize_video()
            logger.info(f"Video saved successfully: {output_path}")
            return True
            
        except Exception as e:
            logger.error(f"Error saving video: {str(e)}")
            return False
    
    def finalize_video(self):
        """Clean up and finalize video writing."""
        if self.writer:
            self.writer.release()
            self.writer = None
    
    def cleanup(self):
        """Clean up resources."""
        if self.cap:
            self.cap.release()
            self.cap = None
        if self.writer:
            self.writer.release()
            self.writer = None
    
    def __del__(self):
        """Destructor to ensure cleanup."""
        self.cleanup()


def validate_video_file(file_path: str) -> bool:
    """
    Validate that a file is a supported video format.
    
    Args:
        file_path: Path to video file
        
    Returns:
        bool: True if file is valid video, False otherwise
    """
    if not os.path.exists(file_path):
        return False
        
    file_ext = os.path.splitext(file_path)[1].lower()
    return file_ext in VideoProcessor.SUPPORTED_FORMATS


def get_video_duration(file_path: str) -> float:
    """
    Get video duration in seconds.
    
    Args:
        file_path: Path to video file
        
    Returns:
        float: Duration in seconds, 0 if error
    """
    try:
        cap = cv2.VideoCapture(file_path)
        if not cap.isOpened():
            return 0.0
            
        frame_count = cap.get(cv2.CAP_PROP_FRAME_COUNT)
        fps = cap.get(cv2.CAP_PROP_FPS)
        cap.release()
        
        return frame_count / fps if fps > 0 else 0.0
        
    except Exception:
        return 0.0