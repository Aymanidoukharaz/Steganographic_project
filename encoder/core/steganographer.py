"""
Steganographic embedding module for hiding subtitle data in video frames.
Implements LSB (Least Significant Bit) encoding with error correction.
"""

import numpy as np
import cv2
import lz4.frame
import struct
import logging
import zlib
from typing import List, Tuple, Optional, Dict, Any
from .subtitle_parser import SubtitleEntry

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class SteganographicEmbedder:
    """Handles steganographic data embedding in video frames."""
    
    # Embedding configuration
    LSB_DEPTH = 2  # 2 bits per channel (6 bits total per pixel)
    TIMING_STRIP_HEIGHT = 5  # Top 5 rows for timing data
    SUBTITLE_REGION_HEIGHT_PERCENT = 10  # Bottom 10% for subtitle data
    
    # Data structure sizes (in bytes)
    FRAME_NUMBER_SIZE = 4  # 32-bit frame number
    TIMESTAMP_SIZE = 4     # 32-bit timestamp in milliseconds
    CHECKSUM_SIZE = 2      # 16-bit CRC checksum
    
    def __init__(self, video_fps: float = 30.0):
        """
        Initialize steganographic embedder.
        
        Args:
            video_fps: Video frame rate for timing calculations
        """
        self.video_fps = video_fps
        self.frame_duration_ms = 1000.0 / video_fps
        self.compression_level = 1  # LZ4 compression level
        
    def embed_frame_data(self, frame: np.ndarray, frame_number: int, 
                        timestamp_ms: int, subtitle_data: Optional[bytes] = None) -> np.ndarray:
        """
        Embed timing and subtitle data in a video frame.
        
        Args:
            frame: Input video frame
            frame_number: Current frame number
            timestamp_ms: Frame timestamp in milliseconds
            subtitle_data: Optional compressed subtitle data
            
        Returns:
            np.ndarray: Frame with embedded data
        """
        if frame is None or frame.size == 0:
            logger.error("Invalid frame provided")
            return frame
            
        result_frame = frame.copy()
        
        try:
            # Embed timing data in top strip
            self._embed_timing_data(result_frame, frame_number, timestamp_ms)
            
            # Embed subtitle data in bottom region if provided
            if subtitle_data:
                self._embed_subtitle_data(result_frame, subtitle_data)
                
            return result_frame
            
        except Exception as e:
            logger.error(f"Error embedding frame data: {str(e)}")
            return frame
    
    def _embed_timing_data(self, frame: np.ndarray, frame_number: int, timestamp_ms: int):
        """
        Embed timing synchronization data in top strip of frame.
        
        Args:
            frame: Frame to modify
            frame_number: Frame number (32-bit)
            timestamp_ms: Timestamp in milliseconds (32-bit)
        """
        height, width = frame.shape[:2]
        
        if height < self.TIMING_STRIP_HEIGHT:
            logger.warning(f"Frame too small for timing strip ({height} < {self.TIMING_STRIP_HEIGHT})")
            return
        
        # Prepare timing data
        timing_data = struct.pack('<II', frame_number, timestamp_ms)  # Little-endian format
        
        # Calculate and append checksum
        checksum = zlib.crc32(timing_data) & 0xFFFF  # 16-bit CRC
        timing_data += struct.pack('<H', checksum)
        
        # Embed in top strip
        region = frame[:self.TIMING_STRIP_HEIGHT, :]
        self._embed_data_in_region(region, timing_data, region_name="timing_strip")
    
    def _embed_subtitle_data(self, frame: np.ndarray, subtitle_data: bytes):
        """
        Embed subtitle data in bottom region of frame.
        
        Args:
            frame: Frame to modify
            subtitle_data: Compressed subtitle data to embed
        """
        height, width = frame.shape[:2]
        
        # Calculate subtitle region bounds
        subtitle_height = max(1, height * self.SUBTITLE_REGION_HEIGHT_PERCENT // 100)
        start_y = height - subtitle_height
        
        if start_y <= self.TIMING_STRIP_HEIGHT:
            logger.warning("Subtitle region overlaps with timing strip")
            return
        
        # Add data length prefix and checksum
        data_length = len(subtitle_data)
        checksum = zlib.crc32(subtitle_data) & 0xFFFF
        
        # Pack: length (4 bytes) + checksum (2 bytes) + data
        packed_data = struct.pack('<IH', data_length, checksum) + subtitle_data
        
        # Embed in bottom region
        region = frame[start_y:, :]
        self._embed_data_in_region(region, packed_data, region_name="subtitle_region")
    
    def _embed_data_in_region(self, region: np.ndarray, data: bytes, region_name: str = "region"):
        """
        Embed data in a specific region using LSB encoding.
        
        Args:
            region: Image region to embed data in (modified in-place)
            data: Raw bytes to embed
            region_name: Name for logging purposes
        """
        if region.size == 0 or len(data) == 0:
            return
        
        height, width = region.shape[:2]
        channels = region.shape[2] if len(region.shape) > 2 else 1
        
        # Calculate available capacity
        pixels_available = height * width
        bits_per_pixel = self.LSB_DEPTH * channels
        capacity_bits = pixels_available * bits_per_pixel
        capacity_bytes = capacity_bits // 8
        
        if len(data) > capacity_bytes:
            logger.error(f"Data too large for {region_name}: {len(data)} bytes > {capacity_bytes} bytes capacity")
            return
        
        # Convert data to bits
        data_bits = []
        for byte in data:
            for i in range(8):
                data_bits.append((byte >> i) & 1)
        
        # Embed bits in region
        bit_idx = 0
        for y in range(height):
            for x in range(width):
                if bit_idx >= len(data_bits):
                    return
                
                pixel = region[y, x]
                if channels == 1:
                    pixel = [pixel]
                elif len(pixel.shape) == 0:
                    pixel = [int(pixel)]
                
                # Modify each channel
                for c in range(min(channels, len(pixel))):
                    for bit_pos in range(self.LSB_DEPTH):
                        if bit_idx >= len(data_bits):
                            return
                        
                        # Clear and set LSB
                        mask = ~(1 << bit_pos)
                        if channels == 1:
                            new_val = (int(region[y, x]) & mask) | (data_bits[bit_idx] << bit_pos)
                            region[y, x] = max(0, min(255, new_val))
                        else:
                            new_val = (int(region[y, x, c]) & mask) | (data_bits[bit_idx] << bit_pos)
                            region[y, x, c] = max(0, min(255, new_val))
                        
                        bit_idx += 1
        
        logger.debug(f"Embedded {len(data)} bytes ({bit_idx} bits) in {region_name}")
    
    def compress_subtitle_text(self, text: str, start_ms: int, end_ms: int) -> bytes:
        """
        Compress subtitle text with timing information.
        
        Args:
            text: Subtitle text to compress
            start_ms: Start time in milliseconds
            end_ms: End time in milliseconds
            
        Returns:
            bytes: Compressed subtitle data
        """
        try:
            # Create subtitle data structure
            subtitle_dict = {
                'text': text,
                'start_ms': start_ms,
                'end_ms': end_ms,
                'encoding': 'utf-8'
            }
            
            # Convert to JSON-like string and encode as UTF-8
            subtitle_str = f"{start_ms}|{end_ms}|{text}"
            subtitle_bytes = subtitle_str.encode('utf-8')
            
            # Compress using LZ4
            compressed = lz4.frame.compress(
                subtitle_bytes,
                compression_level=self.compression_level
            )
            
            logger.debug(f"Compressed subtitle: {len(subtitle_bytes)} -> {len(compressed)} bytes")
            return compressed
            
        except Exception as e:
            logger.error(f"Error compressing subtitle text: {str(e)}")
            return b""
    
    def prepare_subtitle_data_for_frame(self, subtitles: List[SubtitleEntry], 
                                       frame_number: int) -> Optional[bytes]:
        """
        Prepare subtitle data for a specific frame.
        
        Args:
            subtitles: List of all subtitles
            frame_number: Current frame number
            
        Returns:
            bytes or None: Compressed subtitle data if subtitle active at this frame
        """
        # Calculate frame timestamp
        frame_time_ms = int(frame_number * self.frame_duration_ms)
        
        # Find active subtitle
        active_subtitle = None
        for subtitle in subtitles:
            if subtitle.start_ms <= frame_time_ms < subtitle.end_ms:
                active_subtitle = subtitle
                break
        
        if not active_subtitle:
            return None
        
        # Compress and return subtitle data
        return self.compress_subtitle_text(
            active_subtitle.text,
            active_subtitle.start_ms,
            active_subtitle.end_ms
        )
    
    def estimate_capacity(self, frame_width: int, frame_height: int) -> dict:
        """
        Estimate data capacity for given frame dimensions.
        
        Args:
            frame_width: Frame width in pixels
            frame_height: Frame height in pixels
            
        Returns:
            dict: Capacity information
        """
        # Timing strip capacity
        timing_pixels = self.TIMING_STRIP_HEIGHT * frame_width
        timing_capacity = timing_pixels * 3 * self.LSB_DEPTH // 8  # 3 channels (RGB/BGR)
        
        # Subtitle region capacity
        subtitle_height = frame_height * self.SUBTITLE_REGION_HEIGHT_PERCENT // 100
        subtitle_pixels = subtitle_height * frame_width
        subtitle_capacity = subtitle_pixels * 3 * self.LSB_DEPTH // 8
        
        return {
            'frame_dimensions': (frame_width, frame_height),
            'timing_strip': {
                'height': self.TIMING_STRIP_HEIGHT,
                'pixels': timing_pixels,
                'capacity_bytes': timing_capacity,
                'required_bytes': self.FRAME_NUMBER_SIZE + self.TIMESTAMP_SIZE + self.CHECKSUM_SIZE
            },
            'subtitle_region': {
                'height': subtitle_height,
                'pixels': subtitle_pixels,
                'capacity_bytes': subtitle_capacity
            },
            'lsb_depth': self.LSB_DEPTH,
            'total_capacity_bytes': timing_capacity + subtitle_capacity
        }
    
    def validate_embedding_capacity(self, frame_width: int, frame_height: int) -> bool:
        """
        Validate that frame has sufficient capacity for embedding.
        
        Args:
            frame_width: Frame width in pixels
            frame_height: Frame height in pixels
            
        Returns:
            bool: True if capacity is sufficient, False otherwise
        """
        capacity_info = self.estimate_capacity(frame_width, frame_height)
        
        # Check timing strip capacity
        timing_required = capacity_info['timing_strip']['required_bytes']
        timing_available = capacity_info['timing_strip']['capacity_bytes']
        
        if timing_required > timing_available:
            logger.error(f"Insufficient timing strip capacity: {timing_required} > {timing_available}")
            return False
        
        # Check minimum subtitle capacity (at least 100 bytes for reasonable text)
        subtitle_available = capacity_info['subtitle_region']['capacity_bytes']
        if subtitle_available < 100:
            logger.warning(f"Low subtitle capacity: {subtitle_available} bytes")
        
        return True


class SteganographicExtractor:
    """Handles extraction of embedded steganographic data (for validation)."""
    
    def __init__(self):
        """Initialize steganographic extractor."""
        self.embedder = SteganographicEmbedder()
    
    def extract_timing_data(self, frame: np.ndarray) -> Tuple[Optional[int], Optional[int]]:
        """
        Extract timing data from frame's top strip.
        
        Args:
            frame: Frame to extract from
            
        Returns:
            Tuple[frame_number, timestamp_ms] or (None, None) if extraction failed
        """
        try:
            height, width = frame.shape[:2]
            
            if height < self.embedder.TIMING_STRIP_HEIGHT:
                return None, None
            
            # Extract timing strip
            region = frame[:self.embedder.TIMING_STRIP_HEIGHT, :]
            
            # Extract expected number of bytes
            expected_bytes = (self.embedder.FRAME_NUMBER_SIZE + 
                            self.embedder.TIMESTAMP_SIZE + 
                            self.embedder.CHECKSUM_SIZE)
            
            extracted_data = self._extract_data_from_region(region, expected_bytes)
            
            if len(extracted_data) < expected_bytes:
                return None, None
            
            # Unpack data
            frame_number, timestamp_ms, checksum = struct.unpack('<IIH', extracted_data)
            
            # Validate checksum
            data_for_checksum = struct.pack('<II', frame_number, timestamp_ms)
            expected_checksum = zlib.crc32(data_for_checksum) & 0xFFFF
            
            if checksum != expected_checksum:
                logger.warning(f"Timing data checksum mismatch: {checksum} != {expected_checksum}")
                return None, None
            
            return frame_number, timestamp_ms
            
        except Exception as e:
            logger.error(f"Error extracting timing data: {str(e)}")
            return None, None
    
    def _extract_data_from_region(self, region: np.ndarray, num_bytes: int) -> bytes:
        """
        Extract embedded data from a region using LSB decoding.
        
        Args:
            region: Image region to extract from
            num_bytes: Number of bytes to extract
            
        Returns:
            bytes: Extracted data
        """
        if region.size == 0:
            return b""
        
        height, width = region.shape[:2]
        channels = region.shape[2] if len(region.shape) > 2 else 1
        
        # Calculate required bits
        bits_needed = num_bytes * 8
        
        # Extract bits
        extracted_bits = []
        bit_count = 0
        
        for y in range(height):
            for x in range(width):
                if bit_count >= bits_needed:
                    break
                
                pixel = region[y, x]
                if channels == 1:
                    pixel = [pixel]
                elif len(pixel.shape) == 0:
                    pixel = [int(pixel)]
                
                # Extract from each channel
                for c in range(min(channels, len(pixel))):
                    for bit_pos in range(self.embedder.LSB_DEPTH):
                        if bit_count >= bits_needed:
                            break
                        
                        if channels == 1:
                            bit = (region[y, x] >> bit_pos) & 1
                        else:
                            bit = (region[y, x, c] >> bit_pos) & 1
                        
                        extracted_bits.append(bit)
                        bit_count += 1
            
            if bit_count >= bits_needed:
                break
        
        # Convert bits to bytes
        extracted_bytes = bytearray()
        for i in range(0, len(extracted_bits), 8):
            if i + 7 < len(extracted_bits):
                byte_val = 0
                for j in range(8):
                    byte_val |= (extracted_bits[i + j] << j)
                extracted_bytes.append(byte_val)
        
        return bytes(extracted_bytes)


def create_test_embedder(fps: float = 30.0) -> SteganographicEmbedder:
    """
    Create a test steganographic embedder for validation.
    
    Args:
        fps: Video frame rate
        
    Returns:
        SteganographicEmbedder: Test embedder instance
    """
    return SteganographicEmbedder(fps)