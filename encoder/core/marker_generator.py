"""
Corner marker generation module for video detection and homography calculation.
Generates 20x20 pixel markers in each corner with binary-coded IDs and orientation.
"""

import numpy as np
import cv2
import hashlib
import logging
from typing import Tuple, Dict, List
from enum import Enum

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class CornerPosition(Enum):
    """Enumeration for corner positions."""
    TOP_LEFT = "TL"
    TOP_RIGHT = "TR"
    BOTTOM_LEFT = "BL"
    BOTTOM_RIGHT = "BR"


class MarkerGenerator:
    """Generates steganographic corner markers for video detection."""
    
    # Marker configuration
    MARKER_SIZE = 20  # 20x20 pixels
    MARGIN_FROM_EDGE = 60  # 60px from frame edges
    
    # Color encoding configuration
    PATTERN_CHANNEL = 0  # R channel for pattern data
    ERROR_CORRECTION_CHANNEL = 1  # G channel for error correction
    CHECKSUM_CHANNEL = 2  # B channel for checksum
    
    def __init__(self, video_id: str = "STEGANO_AR_2025"):
        """
        Initialize marker generator with unique video ID.
        
        Args:
            video_id: Unique identifier for this video
        """
        self.video_id = video_id
        self.video_hash = self._generate_video_hash(video_id)
        self.markers = {}
        
        # Generate all corner markers
        self._generate_all_markers()
        
    def _generate_video_hash(self, video_id: str) -> int:
        """Generate a hash from video ID for marker embedding."""
        hash_object = hashlib.md5(video_id.encode())
        hash_hex = hash_object.hexdigest()
        # Use first 16 bits of hash as video identifier
        return int(hash_hex[:4], 16)
    
    def _generate_all_markers(self):
        """Generate markers for all four corners."""
        for corner in CornerPosition:
            self.markers[corner] = self._generate_corner_marker(corner)
            logger.debug(f"Generated {corner.value} marker")
    
    def _generate_corner_marker(self, corner: CornerPosition) -> np.ndarray:
        """
        Generate a single corner marker with embedded data.
        
        Args:
            corner: Corner position (TL, TR, BL, BR)
            
        Returns:
            np.ndarray: 20x20x3 marker image (BGR format)
        """
        marker = np.zeros((self.MARKER_SIZE, self.MARKER_SIZE, 3), dtype=np.uint8)
        
        # Create pattern based on corner and video hash
        pattern_data = self._create_pattern_data(corner)
        error_correction = self._generate_error_correction(pattern_data)
        checksum = self._calculate_checksum(pattern_data, error_correction)
        
        # Embed data in different channels
        self._embed_pattern_in_channel(marker, self.PATTERN_CHANNEL, pattern_data)
        self._embed_pattern_in_channel(marker, self.ERROR_CORRECTION_CHANNEL, error_correction)
        self._embed_pattern_in_channel(marker, self.CHECKSUM_CHANNEL, checksum)
        
        # Add high contrast elements for reliable detection
        self._add_detection_pattern(marker, corner)
        
        return marker
    
    def _create_pattern_data(self, corner: CornerPosition) -> List[int]:
        """
        Create pattern data for a corner marker.
        
        Args:
            corner: Corner position
            
        Returns:
            List[int]: Pattern data as list of integers (0-255)
        """
        # Combine video hash with corner identifier
        corner_id = {
            CornerPosition.TOP_LEFT: 0b00,
            CornerPosition.TOP_RIGHT: 0b01,
            CornerPosition.BOTTOM_LEFT: 0b10,
            CornerPosition.BOTTOM_RIGHT: 0b11
        }[corner]
        
        # Create pattern: video_hash (16 bits) + corner_id (2 bits) + padding
        pattern_value = (self.video_hash << 2) | corner_id
        
        # Convert to bytes and pad to fill marker
        pattern_bytes = []
        for i in range(self.MARKER_SIZE * self.MARKER_SIZE // 8):
            byte_val = (pattern_value >> (i * 8)) & 0xFF
            pattern_bytes.append(byte_val)
        
        # Ensure we have enough data
        while len(pattern_bytes) < self.MARKER_SIZE * self.MARKER_SIZE // 8:
            pattern_bytes.append(0)
        
        return pattern_bytes[:self.MARKER_SIZE * self.MARKER_SIZE // 8]
    
    def _generate_error_correction(self, pattern_data: List[int]) -> List[int]:
        """
        Generate error correction data using simple Reed-Solomon-like approach.
        
        Args:
            pattern_data: Original pattern data
            
        Returns:
            List[int]: Error correction data
        """
        # Simple XOR-based error correction for proof of concept
        # In production, would use proper Reed-Solomon codes
        correction = []
        
        for i in range(len(pattern_data)):
            # XOR with shifted pattern for error correction
            correction_byte = pattern_data[i] ^ ((pattern_data[i] << 1) & 0xFF)
            correction.append(correction_byte)
        
        return correction
    
    def _calculate_checksum(self, pattern_data: List[int], error_correction: List[int]) -> List[int]:
        """
        Calculate checksum for validation.
        
        Args:
            pattern_data: Original pattern data
            error_correction: Error correction data
            
        Returns:
            List[int]: Checksum data
        """
        # Simple checksum calculation
        total = sum(pattern_data) + sum(error_correction)
        checksum_val = total & 0xFFFF  # 16-bit checksum
        
        checksum_bytes = []
        for i in range(len(pattern_data)):
            byte_val = (checksum_val >> (i % 16)) & 0xFF
            checksum_bytes.append(byte_val)
        
        return checksum_bytes
    
    def _embed_pattern_in_channel(self, marker: np.ndarray, channel: int, data: List[int]):
        """
        Embed data in specific color channel using LSB.
        
        Args:
            marker: Marker image to modify
            channel: Color channel (0=B, 1=G, 2=R in BGR)
            data: Data to embed
        """
        data_idx = 0
        bit_idx = 0
        
        for y in range(self.MARKER_SIZE):
            for x in range(self.MARKER_SIZE):
                if data_idx >= len(data):
                    break
                
                # Get current pixel value
                pixel_val = marker[y, x, channel]
                
                # Extract bit from data
                if bit_idx < 8:
                    bit = (data[data_idx] >> bit_idx) & 1
                    bit_idx += 1
                else:
                    data_idx += 1
                    bit_idx = 0
                    if data_idx >= len(data):
                        break
                    bit = (data[data_idx] >> bit_idx) & 1
                    bit_idx += 1
                
                # Embed bit in LSB
                pixel_val = (pixel_val & 0xFE) | bit
                marker[y, x, channel] = pixel_val
    
    def _add_detection_pattern(self, marker: np.ndarray, corner: CornerPosition):
        """
        Add high-contrast detection patterns to marker.
        
        Args:
            marker: Marker image to modify
            corner: Corner position for orientation
        """
        # Add border pattern for easy detection
        # Top and bottom borders
        marker[0, :] = [255, 255, 255]  # White top border
        marker[-1, :] = [0, 0, 0]       # Black bottom border
        
        # Left and right borders
        marker[:, 0] = [255, 255, 255]  # White left border
        marker[:, -1] = [0, 0, 0]       # Black right border
        
        # Add corner-specific orientation patterns
        if corner == CornerPosition.TOP_LEFT:
            # Diagonal pattern from top-left
            for i in range(min(5, self.MARKER_SIZE)):
                if i < self.MARKER_SIZE and i < self.MARKER_SIZE:
                    marker[i, i] = [255, 0, 0]  # Red diagonal
        elif corner == CornerPosition.TOP_RIGHT:
            # Diagonal pattern from top-right
            for i in range(min(5, self.MARKER_SIZE)):
                if i < self.MARKER_SIZE and (self.MARKER_SIZE - 1 - i) >= 0:
                    marker[i, self.MARKER_SIZE - 1 - i] = [0, 255, 0]  # Green diagonal
        elif corner == CornerPosition.BOTTOM_LEFT:
            # Diagonal pattern from bottom-left
            for i in range(min(5, self.MARKER_SIZE)):
                if (self.MARKER_SIZE - 1 - i) >= 0 and i < self.MARKER_SIZE:
                    marker[self.MARKER_SIZE - 1 - i, i] = [0, 0, 255]  # Blue diagonal
        elif corner == CornerPosition.BOTTOM_RIGHT:
            # Cross pattern for bottom-right
            mid = self.MARKER_SIZE // 2
            marker[mid, :] = [255, 255, 0]  # Yellow horizontal line
            marker[:, mid] = [255, 255, 0]  # Yellow vertical line
    
    def embed_markers_in_frame(self, frame: np.ndarray) -> np.ndarray:
        """
        Embed all corner markers in a video frame.
        
        Args:
            frame: Input video frame
            
        Returns:
            np.ndarray: Frame with embedded markers
        """
        if frame is None or frame.size == 0:
            logger.error("Invalid frame provided")
            return frame
        
        frame_height, frame_width = frame.shape[:2]
        result_frame = frame.copy()
        
        # Calculate positions for each corner
        positions = self._calculate_marker_positions(frame_width, frame_height)
        
        # Embed each marker
        for corner, (x, y) in positions.items():
            marker = self.markers[corner]
            
            # Ensure marker fits in frame
            if (x + self.MARKER_SIZE <= frame_width and 
                y + self.MARKER_SIZE <= frame_height and
                x >= 0 and y >= 0):
                
                result_frame[y:y+self.MARKER_SIZE, x:x+self.MARKER_SIZE] = marker
            else:
                logger.warning(f"Marker {corner.value} doesn't fit in frame at ({x}, {y})")
        
        return result_frame
    
    def _calculate_marker_positions(self, frame_width: int, frame_height: int) -> Dict[CornerPosition, Tuple[int, int]]:
        """
        Calculate pixel positions for corner markers.
        
        Args:
            frame_width: Frame width in pixels
            frame_height: Frame height in pixels
            
        Returns:
            Dict mapping corner positions to (x, y) coordinates
        """
        return {
            CornerPosition.TOP_LEFT: (
                self.MARGIN_FROM_EDGE,
                self.MARGIN_FROM_EDGE
            ),
            CornerPosition.TOP_RIGHT: (
                frame_width - self.MARGIN_FROM_EDGE - self.MARKER_SIZE,
                self.MARGIN_FROM_EDGE
            ),
            CornerPosition.BOTTOM_LEFT: (
                self.MARGIN_FROM_EDGE,
                frame_height - self.MARGIN_FROM_EDGE - self.MARKER_SIZE
            ),
            CornerPosition.BOTTOM_RIGHT: (
                frame_width - self.MARGIN_FROM_EDGE - self.MARKER_SIZE,
                frame_height - self.MARGIN_FROM_EDGE - self.MARKER_SIZE
            )
        }
    
    def validate_marker_embedding(self, original_frame: np.ndarray, marked_frame: np.ndarray) -> bool:
        """
        Validate that markers were embedded correctly.
        
        Args:
            original_frame: Original frame before marking
            marked_frame: Frame after marker embedding
            
        Returns:
            bool: True if markers detected correctly, False otherwise
        """
        try:
            frame_height, frame_width = original_frame.shape[:2]
            positions = self._calculate_marker_positions(frame_width, frame_height)
            
            # Check each marker position
            for corner, (x, y) in positions.items():
                if (x + self.MARKER_SIZE > frame_width or 
                    y + self.MARKER_SIZE > frame_height):
                    continue
                
                # Extract marker region
                marker_region = marked_frame[y:y+self.MARKER_SIZE, x:x+self.MARKER_SIZE]
                expected_marker = self.markers[corner]
                
                # Compare with expected marker (allowing for some compression artifacts)
                diff = cv2.absdiff(marker_region, expected_marker)
                mean_diff = np.mean(diff)
                
                # If difference is too large, marker wasn't embedded correctly
                if mean_diff > 50:  # Threshold for compression tolerance
                    logger.warning(f"Marker {corner.value} validation failed (diff: {mean_diff})")
                    return False
            
            return True
            
        except Exception as e:
            logger.error(f"Error validating marker embedding: {str(e)}")
            return False
    
    def get_marker_info(self) -> dict:
        """
        Get information about generated markers.
        
        Returns:
            dict: Marker generation information
        """
        return {
            'video_id': self.video_id,
            'video_hash': self.video_hash,
            'marker_size': self.MARKER_SIZE,
            'margin_from_edge': self.MARGIN_FROM_EDGE,
            'corners_generated': len(self.markers),
            'pattern_encoding': {
                'pattern_channel': self.PATTERN_CHANNEL,
                'error_correction_channel': self.ERROR_CORRECTION_CHANNEL,
                'checksum_channel': self.CHECKSUM_CHANNEL
            }
        }
    
    def create_debug_visualization(self, frame: np.ndarray) -> np.ndarray:
        """
        Create a debug visualization showing marker positions.
        
        Args:
            frame: Input frame
            
        Returns:
            np.ndarray: Frame with marker position highlights
        """
        debug_frame = frame.copy()
        frame_height, frame_width = frame.shape[:2]
        positions = self._calculate_marker_positions(frame_width, frame_height)
        
        # Draw marker position rectangles
        for corner, (x, y) in positions.items():
            color = {
                CornerPosition.TOP_LEFT: (0, 0, 255),     # Red
                CornerPosition.TOP_RIGHT: (0, 255, 0),    # Green
                CornerPosition.BOTTOM_LEFT: (255, 0, 0),  # Blue
                CornerPosition.BOTTOM_RIGHT: (0, 255, 255) # Yellow
            }[corner]
            
            # Draw rectangle outline
            cv2.rectangle(debug_frame, (x, y), 
                         (x + self.MARKER_SIZE, y + self.MARKER_SIZE), 
                         color, 2)
            
            # Add corner label
            cv2.putText(debug_frame, corner.value, (x, y - 5),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 1)
        
        return debug_frame


def create_test_marker_generator() -> MarkerGenerator:
    """
    Create a test marker generator for validation.
    
    Returns:
        MarkerGenerator: Test marker generator instance
    """
    return MarkerGenerator("TEST_VIDEO_2025")