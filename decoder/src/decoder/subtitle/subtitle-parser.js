/**
 * Subtitle Parser
 * Parses decoded subtitle text into structured format
 */

/**
 * Parse decoded subtitle text into structured format
 * Expected format: "startTime|endTime|text"
 * Example: "1000|3000|Bonjour le monde!"
 * @param {string} decodedText - Decompressed subtitle text
 * @param {number} currentTimestamp - Current video timestamp
 * @returns {object} Structured subtitle object
 */
export function parseSubtitle(decodedText, currentTimestamp) {
  try {
    if (!decodedText || typeof decodedText !== 'string') {
      throw new Error('Invalid decoded text');
    }
    
    // Trim whitespace and control characters
    const cleanText = decodedText.trim();
    
    if (cleanText.length === 0) {
      throw new Error('Empty decoded text');
    }
    
    console.log('[Subtitle Parser] Parsing:', cleanText.substring(0, 100));
    
    // Split by pipe delimiter
    const parts = cleanText.split('|');
    
    if (parts.length < 3) {
      // Try alternative format or fallback
      return parseAlternativeFormat(cleanText, currentTimestamp);
    }
    
    // Parse standard format: startTime|endTime|text
    const startTime = parseInt(parts[0], 10);
    const endTime = parseInt(parts[1], 10);
    const text = parts.slice(2).join('|'); // Join in case text contains pipes
    
    // Validate parsed values
    if (isNaN(startTime) || isNaN(endTime)) {
      throw new Error(`Invalid timing values: ${parts[0]}, ${parts[1]}`);
    }
    
    if (!text || text.trim().length === 0) {
      throw new Error('Empty subtitle text');
    }
    
    const subtitle = {
      id: generateSubtitleId(startTime, text),
      startTime: startTime,
      endTime: endTime,
      text: text.trim(),
      timestamp: currentTimestamp,
      duration: endTime - startTime
    };
    
    console.log('[Subtitle Parser] ✅ Parsed:', {
      startTime: `${startTime}ms`,
      endTime: `${endTime}ms`,
      duration: `${subtitle.duration}ms`,
      text: text.substring(0, 50)
    });
    
    return subtitle;
    
  } catch (error) {
    console.error('[Subtitle Parser] ❌ Parse failed:', error);
    throw new Error(`Subtitle parsing failed: ${error.message}`);
  }
}

/**
 * Parse alternative subtitle formats
 * Fallback for different encoding schemes
 * @param {string} text - Raw text
 * @param {number} timestamp - Current timestamp
 * @returns {object} Subtitle object
 */
function parseAlternativeFormat(text, timestamp) {
  console.warn('[Subtitle Parser] Trying alternative format...');
  
  // Try comma-separated
  if (text.includes(',')) {
    const parts = text.split(',');
    if (parts.length >= 3) {
      return {
        id: Date.now(),
        startTime: parseInt(parts[0], 10) || timestamp,
        endTime: parseInt(parts[1], 10) || timestamp + 2000,
        text: parts.slice(2).join(',').trim(),
        timestamp: timestamp,
        duration: 2000
      };
    }
  }
  
  // Fallback: treat as plain text with estimated timing
  return {
    id: Date.now(),
    startTime: timestamp,
    endTime: timestamp + 2000, // Default 2 second duration
    text: text.trim(),
    timestamp: timestamp,
    duration: 2000,
    estimated: true
  };
}

/**
 * Generate unique subtitle ID
 * @param {number} startTime - Subtitle start time
 * @param {string} text - Subtitle text
 * @returns {string} Unique ID
 */
function generateSubtitleId(startTime, text) {
  // Create hash-like ID from time and text
  const textHash = simpleHash(text);
  return `sub_${startTime}_${textHash}`;
}

/**
 * Simple hash function for strings
 * @param {string} str - String to hash
 * @returns {number} Hash value
 */
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Validate subtitle object structure
 * @param {object} subtitle - Subtitle to validate
 * @returns {boolean} True if valid
 */
export function validateSubtitle(subtitle) {
  if (!subtitle) return false;
  
  const required = ['id', 'startTime', 'endTime', 'text'];
  const hasRequired = required.every(field => subtitle.hasOwnProperty(field));
  
  if (!hasRequired) {
    console.warn('[Subtitle Parser] Missing required fields:', subtitle);
    return false;
  }
  
  // Validate timing
  if (subtitle.endTime <= subtitle.startTime) {
    console.warn('[Subtitle Parser] Invalid timing:', {
      start: subtitle.startTime,
      end: subtitle.endTime
    });
    return false;
  }
  
  // Validate text
  if (typeof subtitle.text !== 'string' || subtitle.text.trim().length === 0) {
    console.warn('[Subtitle Parser] Invalid text:', subtitle.text);
    return false;
  }
  
  return true;
}

/**
 * Format subtitle for display
 * Handles French accents and special characters
 * @param {object} subtitle - Subtitle object
 * @returns {string} Formatted text
 */
export function formatSubtitleText(subtitle) {
  if (!subtitle || !subtitle.text) {
    return '';
  }
  
  let text = subtitle.text;
  
  // Normalize whitespace
  text = text.replace(/\s+/g, ' ').trim();
  
  // Ensure proper French spacing (space before : ; ! ?)
  text = text.replace(/\s*([;:!?])/g, ' $1');
  
  // Remove duplicate spaces
  text = text.replace(/\s{2,}/g, ' ');
  
  return text;
}

/**
 * Parse multiple subtitles from batch data
 * @param {string} batchText - Multiple subtitles concatenated
 * @param {number} timestamp - Base timestamp
 * @returns {Array<object>} Array of subtitle objects
 */
export function parseBatchSubtitles(batchText, timestamp) {
  const subtitles = [];
  
  // Split by newline or double pipe
  const lines = batchText.split(/\n|(\|\|)/);
  
  for (const line of lines) {
    if (line && line.trim().length > 0) {
      try {
        const subtitle = parseSubtitle(line, timestamp);
        if (validateSubtitle(subtitle)) {
          subtitles.push(subtitle);
        }
      } catch (e) {
        console.warn('[Subtitle Parser] Skipping invalid line:', line);
      }
    }
  }
  
  return subtitles;
}
