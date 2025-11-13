/**
 * Error Correction
 * Validates data integrity using checksums
 */

/**
 * Calculate simple checksum for data validation
 * @param {Uint8Array} data - Data to checksum
 * @returns {number} 16-bit checksum value
 */
export function calculateChecksum(data) {
  let sum = 0;
  
  for (let i = 0; i < data.length; i++) {
    sum = (sum + data[i]) & 0xFFFF; // Keep it 16-bit
  }
  
  return sum;
}

/**
 * Validate timing data checksum
 * Timing format: [frameNumber(4) | timestamp(4) | checksum(2)]
 * @param {object} timingData - Parsed timing data
 * @returns {boolean} True if checksum is valid
 */
export function validateChecksum(timingData) {
  if (!timingData || !timingData.rawData) {
    console.error('[Error Correction] No timing data to validate');
    return false;
  }
  
  const { rawData, checksum } = timingData;
  
  // Calculate checksum for first 8 bytes (frameNumber + timestamp)
  const dataToCheck = rawData.slice(0, 8);
  const calculatedChecksum = calculateChecksum(dataToCheck);
  
  const isValid = calculatedChecksum === checksum;
  
  if (!isValid) {
    console.warn('[Error Correction] ❌ Checksum mismatch!', {
      expected: checksum,
      calculated: calculatedChecksum
    });
  } else {
    console.log('[Error Correction] ✅ Checksum valid');
  }
  
  return isValid;
}

/**
 * Verify data integrity with multiple checks
 * @param {Uint8Array} data - Data to verify
 * @param {number} expectedChecksum - Expected checksum value
 * @returns {boolean} True if data is valid
 */
export function verifyDataIntegrity(data, expectedChecksum) {
  if (!data || data.length === 0) {
    return false;
  }
  
  const calculated = calculateChecksum(data);
  return calculated === expectedChecksum;
}

/**
 * Calculate XOR checksum (alternative method)
 * @param {Uint8Array} data - Data to checksum
 * @returns {number} XOR checksum value
 */
export function calculateXORChecksum(data) {
  let xor = 0;
  
  for (let i = 0; i < data.length; i++) {
    xor ^= data[i];
  }
  
  return xor;
}

/**
 * Detect bit errors in data
 * Simple error detection by analyzing byte distribution
 * @param {Uint8Array} data - Data to analyze
 * @returns {object} Error analysis result
 */
export function analyzeErrors(data) {
  if (!data || data.length === 0) {
    return { hasErrors: true, reason: 'Empty data' };
  }
  
  // Check for all zeros (likely corrupted)
  const allZeros = data.every(byte => byte === 0);
  if (allZeros) {
    return { hasErrors: true, reason: 'All zeros detected' };
  }
  
  // Check for all 255s (likely corrupted)
  const allOnes = data.every(byte => byte === 255);
  if (allOnes) {
    return { hasErrors: true, reason: 'All ones detected' };
  }
  
  // Count unique values (should have variety)
  const uniqueValues = new Set(data).size;
  const uniqueRatio = uniqueValues / Math.min(256, data.length);
  
  if (uniqueRatio < 0.1) {
    return { 
      hasErrors: true, 
      reason: 'Low entropy (not enough variety)',
      uniqueRatio 
    };
  }
  
  return { 
    hasErrors: false, 
    uniqueValues,
    uniqueRatio 
  };
}

/**
 * Reed-Solomon error correction (simplified placeholder)
 * Full Reed-Solomon implementation would require a library
 * This is a placeholder for Phase 4
 * @param {Uint8Array} data - Data with potential errors
 * @returns {Uint8Array} Corrected data (or original if not implemented)
 */
export function reedSolomonCorrect(data) {
  // TODO: Implement Reed-Solomon error correction
  // For Phase 4, we'll rely on checksums and retry logic
  console.warn('[Error Correction] Reed-Solomon not yet implemented, returning original data');
  return data;
}

/**
 * Validate subtitle data structure
 * @param {string} text - Decoded subtitle text
 * @returns {boolean} True if structure seems valid
 */
export function validateSubtitleStructure(text) {
  if (!text || typeof text !== 'string') {
    return false;
  }
  
  // Check for expected delimiter
  if (!text.includes('|')) {
    console.warn('[Error Correction] Missing pipe delimiter in subtitle data');
    return false;
  }
  
  // Check minimum length
  if (text.length < 5) {
    console.warn('[Error Correction] Subtitle text too short');
    return false;
  }
  
  return true;
}
