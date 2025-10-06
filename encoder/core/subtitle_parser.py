"""
Subtitle parsing module for SRT and VTT subtitle formats.
Handles French text encoding (UTF-8) and timing extraction.
"""

import pysrt
import webvtt
import os
import logging
from typing import List, Tuple, Optional
from dataclasses import dataclass
import re

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class SubtitleEntry:
    """Represents a single subtitle entry with timing and text."""
    start_ms: int  # Start time in milliseconds
    end_ms: int    # End time in milliseconds
    text: str      # Subtitle text (UTF-8 encoded)
    index: int     # Subtitle index/number
    
    def __str__(self):
        return f"[{self.start_ms}-{self.end_ms}ms] {self.text}"
    
    def duration_ms(self) -> int:
        """Get duration in milliseconds."""
        return self.end_ms - self.start_ms
    
    def overlaps_with(self, other: 'SubtitleEntry') -> bool:
        """Check if this subtitle overlaps with another."""
        return not (self.end_ms <= other.start_ms or other.end_ms <= self.start_ms)


class SubtitleParser:
    """Parser for SRT and VTT subtitle formats with French text support."""
    
    SUPPORTED_FORMATS = ['.srt', '.vtt']
    
    def __init__(self):
        self.subtitles: List[SubtitleEntry] = []
        self.file_path: Optional[str] = None
        self.format: Optional[str] = None
        
    def load_subtitle_file(self, file_path: str) -> bool:
        """
        Load and parse subtitle file.
        
        Args:
            file_path: Path to subtitle file (.srt or .vtt)
            
        Returns:
            bool: True if loaded successfully, False otherwise
        """
        if not os.path.exists(file_path):
            logger.error(f"Subtitle file not found: {file_path}")
            return False
            
        file_ext = os.path.splitext(file_path)[1].lower()
        if file_ext not in self.SUPPORTED_FORMATS:
            logger.error(f"Unsupported subtitle format: {file_ext}")
            return False
            
        self.file_path = file_path
        self.format = file_ext
        
        try:
            if file_ext == '.srt':
                return self._parse_srt(file_path)
            elif file_ext == '.vtt':
                return self._parse_vtt(file_path)
        except Exception as e:
            logger.error(f"Error parsing subtitle file: {str(e)}")
            return False
            
        return False
    
    def _parse_srt(self, file_path: str) -> bool:
        """
        Parse SRT subtitle file.
        
        Args:
            file_path: Path to SRT file
            
        Returns:
            bool: True if parsed successfully, False otherwise
        """
        try:
            # Try different encodings for French text
            encodings = ['utf-8', 'utf-8-sig', 'latin-1', 'cp1252']
            subs = None
            
            for encoding in encodings:
                try:
                    subs = pysrt.open(file_path, encoding=encoding)
                    break
                except UnicodeDecodeError:
                    continue
            
            if subs is None:
                logger.error(f"Could not decode SRT file with any encoding: {file_path}")
                return False
            
            self.subtitles = []
            for i, sub in enumerate(subs):
                # Convert timing to milliseconds
                start_ms = self._pysrt_time_to_ms(sub.start)
                end_ms = self._pysrt_time_to_ms(sub.end)
                
                # Clean and normalize text
                text = self._clean_subtitle_text(sub.text)
                
                entry = SubtitleEntry(
                    start_ms=start_ms,
                    end_ms=end_ms,
                    text=text,
                    index=i + 1
                )
                self.subtitles.append(entry)
            
            logger.info(f"Parsed {len(self.subtitles)} SRT entries from {file_path}")
            return True
            
        except Exception as e:
            logger.error(f"Error parsing SRT file: {str(e)}")
            return False
    
    def _parse_vtt(self, file_path: str) -> bool:
        """
        Parse VTT (WebVTT) subtitle file.
        
        Args:
            file_path: Path to VTT file
            
        Returns:
            bool: True if parsed successfully, False otherwise
        """
        try:
            # WebVTT library handles encoding automatically
            vtt = webvtt.read(file_path)
            
            self.subtitles = []
            for i, caption in enumerate(vtt):
                # Convert timing to milliseconds
                start_ms = self._webvtt_time_to_ms(caption.start)
                end_ms = self._webvtt_time_to_ms(caption.end)
                
                # Clean and normalize text
                text = self._clean_subtitle_text(caption.text)
                
                entry = SubtitleEntry(
                    start_ms=start_ms,
                    end_ms=end_ms,
                    text=text,
                    index=i + 1
                )
                self.subtitles.append(entry)
            
            logger.info(f"Parsed {len(self.subtitles)} VTT entries from {file_path}")
            return True
            
        except Exception as e:
            logger.error(f"Error parsing VTT file: {str(e)}")
            return False
    
    def _pysrt_time_to_ms(self, pysrt_time) -> int:
        """Convert pysrt time object to milliseconds."""
        return (pysrt_time.hours * 3600000 + 
                pysrt_time.minutes * 60000 + 
                pysrt_time.seconds * 1000 + 
                pysrt_time.milliseconds)
    
    def _webvtt_time_to_ms(self, time_str: str) -> int:
        """
        Convert WebVTT time string to milliseconds.
        Formats: "MM:SS.mmm" or "HH:MM:SS.mmm"
        """
        try:
            # Handle both HH:MM:SS.mmm and MM:SS.mmm formats
            parts = time_str.split(':')
            if len(parts) == 2:
                # MM:SS.mmm format
                minutes = int(parts[0])
                seconds_ms = parts[1].split('.')
                seconds = int(seconds_ms[0])
                milliseconds = int(seconds_ms[1]) if len(seconds_ms) > 1 else 0
                
                return minutes * 60000 + seconds * 1000 + milliseconds
                
            elif len(parts) == 3:
                # HH:MM:SS.mmm format
                hours = int(parts[0])
                minutes = int(parts[1])
                seconds_ms = parts[2].split('.')
                seconds = int(seconds_ms[0])
                milliseconds = int(seconds_ms[1]) if len(seconds_ms) > 1 else 0
                
                return hours * 3600000 + minutes * 60000 + seconds * 1000 + milliseconds
            
            return 0
            
        except Exception as e:
            logger.warning(f"Could not parse time string '{time_str}': {str(e)}")
            return 0
    
    def _clean_subtitle_text(self, text: str) -> str:
        """
        Clean and normalize subtitle text.
        
        Args:
            text: Raw subtitle text
            
        Returns:
            str: Cleaned text
        """
        if not text:
            return ""
        
        # Remove HTML tags
        text = re.sub(r'<[^>]+>', '', text)
        
        # Remove formatting tags like {b}, {i}, etc.
        text = re.sub(r'\{[^}]+\}', '', text)
        
        # Normalize whitespace
        text = ' '.join(text.split())
        
        # Ensure proper UTF-8 encoding for French characters
        text = text.encode('utf-8', errors='ignore').decode('utf-8')
        
        return text.strip()
    
    def get_subtitles(self) -> List[SubtitleEntry]:
        """Get list of parsed subtitles."""
        return self.subtitles.copy()
    
    def get_subtitle_at_time(self, time_ms: int) -> Optional[SubtitleEntry]:
        """
        Get subtitle that should be displayed at given time.
        
        Args:
            time_ms: Time in milliseconds
            
        Returns:
            SubtitleEntry or None if no subtitle at that time
        """
        for subtitle in self.subtitles:
            if subtitle.start_ms <= time_ms < subtitle.end_ms:
                return subtitle
        return None
    
    def get_subtitles_in_range(self, start_ms: int, end_ms: int) -> List[SubtitleEntry]:
        """
        Get all subtitles that appear in the given time range.
        
        Args:
            start_ms: Start time in milliseconds
            end_ms: End time in milliseconds
            
        Returns:
            List of SubtitleEntry objects in the range
        """
        result = []
        for subtitle in self.subtitles:
            if not (subtitle.end_ms <= start_ms or subtitle.start_ms >= end_ms):
                result.append(subtitle)
        return result
    
    def validate_timing(self) -> List[str]:
        """
        Validate subtitle timing for common issues.
        
        Returns:
            List of validation warnings/errors
        """
        issues = []
        
        if not self.subtitles:
            return ["No subtitles loaded"]
        
        # Check for overlapping subtitles
        for i in range(len(self.subtitles) - 1):
            current = self.subtitles[i]
            next_sub = self.subtitles[i + 1]
            
            if current.overlaps_with(next_sub):
                issues.append(f"Subtitles {current.index} and {next_sub.index} overlap")
        
        # Check for very short durations (< 500ms)
        for subtitle in self.subtitles:
            if subtitle.duration_ms() < 500:
                issues.append(f"Subtitle {subtitle.index} has very short duration ({subtitle.duration_ms()}ms)")
        
        # Check for very long durations (> 10 seconds)
        for subtitle in self.subtitles:
            if subtitle.duration_ms() > 10000:
                issues.append(f"Subtitle {subtitle.index} has very long duration ({subtitle.duration_ms()}ms)")
        
        return issues
    
    def get_statistics(self) -> dict:
        """
        Get statistics about the loaded subtitles.
        
        Returns:
            dict: Statistics including count, total duration, etc.
        """
        if not self.subtitles:
            return {}
        
        total_duration = sum(sub.duration_ms() for sub in self.subtitles)
        avg_duration = total_duration / len(self.subtitles)
        
        first_subtitle = min(self.subtitles, key=lambda x: x.start_ms)
        last_subtitle = max(self.subtitles, key=lambda x: x.end_ms)
        
        return {
            'count': len(self.subtitles),
            'total_duration_ms': total_duration,
            'average_duration_ms': avg_duration,
            'first_start_ms': first_subtitle.start_ms,
            'last_end_ms': last_subtitle.end_ms,
            'total_span_ms': last_subtitle.end_ms - first_subtitle.start_ms,
            'format': self.format,
            'file_path': self.file_path
        }


def validate_subtitle_file(file_path: str) -> bool:
    """
    Validate that a file is a supported subtitle format.
    
    Args:
        file_path: Path to subtitle file
        
    Returns:
        bool: True if file is valid subtitle format, False otherwise
    """
    if not os.path.exists(file_path):
        return False
        
    file_ext = os.path.splitext(file_path)[1].lower()
    return file_ext in SubtitleParser.SUPPORTED_FORMATS


def create_test_srt_content() -> str:
    """
    Create test SRT content with French text for testing.
    
    Returns:
        str: Test SRT content with French accents
    """
    return """1
00:00:00,000 --> 00:00:03,000
Bonjour! Voici le premier sous-titre français.

2
00:00:03,500 --> 00:00:07,000
Les caractères spéciaux: é, è, à, ç, ñ, ê, ô.

3
00:00:07,500 --> 00:00:11,000
Système de décodage stéganographique en réalité augmentée.

4
00:00:11,500 --> 00:00:15,000
Développé par AYMAN IDOUKHARAZ pour l'université.

5
00:00:15,500 --> 00:00:19,000
Démonstration réussie de l'intégration AR et IA.

6
00:00:19,500 --> 00:00:22,000
Merci d'avoir regardé cette présentation!
"""