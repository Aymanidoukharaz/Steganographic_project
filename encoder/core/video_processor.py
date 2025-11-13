"""
Video processing module for loading, processing, and saving video files.
Handles MP4, AVI, MOV formats with H.264 output codec.
Preserves audio using ffmpeg.
"""

import cv2
import numpy as np
import os
import subprocess
from typing import Tuple, List, Optional, Callable
import logging
from pathlib import Path
import glob

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
        Preserves audio from original video using ffmpeg.
        
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
            
            # Save to temporary file without audio first
            # Use unique temp filename to avoid conflicts
            import time
            temp_output = output_path.replace('.mp4', f'_temp_no_audio_{int(time.time())}.mp4')
            
            # Delete temp file if it already exists
            if os.path.exists(temp_output):
                try:
                    os.remove(temp_output)
                    logger.info(f"Removed existing temp file: {temp_output}")
                except Exception as e:
                    logger.warning(f"Could not remove temp file: {e}")
            
            if not self.setup_video_writer(temp_output, (frame_width, frame_height)):
                return False
            
            # Write all frames
            total_frames = len(frames)
            for i, frame in enumerate(frames):
                if not self.write_frame(frame):
                    logger.error(f"Failed to write frame {i}")
                    return False
                    
                # Report progress
                if progress_callback:
                    progress = 0.7 + (i + 1) / total_frames * 0.25  # 70-95% for saving
                    progress_callback(progress)
            
            self.finalize_video()
            
            # Now merge with original audio using ffmpeg
            logger.info("Merging video with original audio...")
            
            # Delete output file if it already exists
            if os.path.exists(output_path):
                try:
                    os.remove(output_path)
                    logger.info(f"Removed existing output file: {output_path}")
                except Exception as e:
                    logger.warning(f"Could not remove existing output: {e}")
            
            if self.video_path and self._merge_audio(temp_output, self.video_path, output_path):
                # Clean up temp file
                try:
                    os.remove(temp_output)
                    logger.info("Cleaned up temporary file")
                except Exception as e:
                    logger.warning(f"Could not remove temp file: {e}")
                logger.info(f"Video saved successfully with audio: {output_path}")
            else:
                # If audio merge fails, use video without audio
                logger.warning("Audio merge failed or no original audio, using video without audio")
                if os.path.exists(temp_output):
                    try:
                        if os.path.exists(output_path):
                            os.remove(output_path)
                        os.rename(temp_output, output_path)
                    except Exception as e:
                        logger.error(f"Error renaming temp file: {e}")
                        # Copy instead of rename if rename fails
                        import shutil
                        shutil.copy2(temp_output, output_path)
                        os.remove(temp_output)
                logger.info(f"Video saved without audio: {output_path}")
            
            if progress_callback:
                progress_callback(1.0)  # 100%
            
            return True
            
        except Exception as e:
            logger.error(f"Error saving video: {str(e)}")
            return False
    
    def finalize_video(self):
        """Clean up and finalize video writing."""
        if self.writer:
            self.writer.release()
            self.writer = None
    
    def _merge_audio(self, video_no_audio: str, original_video: str, output_with_audio: str) -> bool:
        """
        Merge audio from original video with new video using ffmpeg.
        
        Args:
            video_no_audio: Path to video without audio
            original_video: Path to original video with audio
            output_with_audio: Path for output video with audio
            
        Returns:
            bool: True if merge successful, False otherwise
        """
        try:
            # Find ffmpeg executable
            ffmpeg_path = self._find_ffmpeg()
            if not ffmpeg_path:
                logger.warning("ffmpeg not found, cannot merge audio")
                return False
            
            logger.info(f"Using ffmpeg: {ffmpeg_path}")
            
            # Build ffmpeg command to merge audio from original video
            # -i input1.mp4 -i input2.mp4 -c copy -map 0:v:0 -map 1:a:0 output.mp4
            cmd = [
                ffmpeg_path,
                '-y',  # Overwrite output file
                '-i', video_no_audio,  # Input video (no audio)
                '-i', original_video,   # Input audio source
                '-c:v', 'copy',         # Copy video codec (no re-encoding)
                '-c:a', 'aac',          # Use AAC for audio
                '-map', '0:v:0',        # Map video from first input
                '-map', '1:a:0?',       # Map audio from second input (? = optional)
                '-shortest',            # Finish encoding when shortest stream ends
                output_with_audio
            ]
            
            # Run ffmpeg
            logger.info(f"Running ffmpeg to merge audio...")
            result = subprocess.run(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                timeout=300  # 5 minute timeout
            )
            
            if result.returncode == 0:
                logger.info("✅ Audio merged successfully")
                return True
            else:
                logger.warning(f"ffmpeg failed: {result.stderr.decode('utf-8', errors='ignore')}")
                return False
                
        except FileNotFoundError:
            logger.warning("ffmpeg executable not found")
            return False
        except subprocess.TimeoutExpired:
            logger.error("ffmpeg timeout - video too long or process hung")
            return False
        except Exception as e:
            logger.error(f"Error merging audio: {str(e)}")
            return False
        except subprocess.TimeoutExpired:
            logger.error("ffmpeg timeout (> 5 minutes)")
            return False
        except Exception as e:
            logger.error(f"Error merging audio: {str(e)}")
            return False
    
    def _find_ffmpeg(self) -> Optional[str]:
        """
        Find ffmpeg executable on the system.
        Checks PATH first, then common Windows installation locations.
        
        Returns:
            str: Path to ffmpeg executable, or None if not found
        """
        # First try from PATH
        try:
            result = subprocess.run(
                ['ffmpeg', '-version'],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                timeout=5
            )
            if result.returncode == 0:
                return 'ffmpeg'  # It's in PATH
        except:
            pass
        
        # Search in common Windows locations
        search_paths = [
            # WinGet installation path
            os.path.expandvars(r'%LOCALAPPDATA%\Microsoft\WinGet\Packages\Gyan.FFmpeg*\*\bin\ffmpeg.exe'),
            # Program Files
            r'C:\Program Files\ffmpeg\bin\ffmpeg.exe',
            r'C:\Program Files (x86)\ffmpeg\bin\ffmpeg.exe',
            # User local
            os.path.expanduser(r'~\ffmpeg\bin\ffmpeg.exe'),
        ]
        
        for pattern in search_paths:
            matches = glob.glob(pattern)
            if matches:
                ffmpeg_path = matches[0]
                logger.info(f"Found ffmpeg at: {ffmpeg_path}")
                return ffmpeg_path
        
        logger.warning("ffmpeg not found in PATH or common installation locations")
        return None
    
    def _check_ffmpeg(self) -> bool:
        """
        Check if ffmpeg is available.
        
        Returns:
            bool: True if ffmpeg is available, False otherwise
        """
        return self._find_ffmpeg() is not None
    
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