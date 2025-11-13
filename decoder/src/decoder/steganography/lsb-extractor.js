/**
 * LSB (Least Significant Bit) Extractor
 * Extracts steganographic data embedded in image regions
 * Encoder uses 2 bits per RGB channel (6 bits per pixel)
 */

/**
 * Extract LSB-encoded data from image region
 * @param {cv.Mat} regionMat - OpenCV Mat containing the data region
 * @returns {Uint8Array} Extracted byte array
 */
export function extractLSBData(regionMat) {
  try {
    const data = regionMat.data; // Uint8ClampedArray (RGBA format)
    const extractedBits = [];
    
    // Process pixels (R, G, B, A format in cv.Mat.data)
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      // Alpha channel (i+3) is ignored
      
      // Extract 2 LSB from each RGB channel
      const rBits = r & 0b00000011;  // Get last 2 bits
      const gBits = g & 0b00000011;
      const bBits = b & 0b00000011;
      
      // Store the extracted 2-bit values
      extractedBits.push(rBits, gBits, bBits);
    }
    
    // Convert bit groups to bytes
    return bitsToBytes(extractedBits);
    
  } catch (error) {
    console.error('[LSB Extractor] Extraction failed:', error);
    throw new Error(`LSB extraction failed: ${error.message}`);
  }
}

/**
 * Convert array of 2-bit values to byte array
 * 4 groups of 2 bits = 1 byte (8 bits)
 * @param {Array<number>} bits - Array of 2-bit values
 * @returns {Uint8Array} Reconstructed byte array
 */
function bitsToBytes(bits) {
  const bytes = [];
  
  // Process 4 values at a time (4 × 2 bits = 8 bits = 1 byte)
  for (let i = 0; i < bits.length - 3; i += 4) {
    const byte = (bits[i] << 6) | 
                 (bits[i + 1] << 4) | 
                 (bits[i + 2] << 2) | 
                 bits[i + 3];
    bytes.push(byte);
  }
  
  return new Uint8Array(bytes);
}

/**
 * Extract specific byte range from LSB data
 * Used for parsing structured data (timestamps, checksums, etc.)
 * @param {Uint8Array} data - Full extracted data
 * @param {number} offset - Starting byte offset
 * @param {number} length - Number of bytes to extract
 * @returns {Uint8Array} Extracted segment
 */
export function extractBytes(data, offset, length) {
  if (offset + length > data.length) {
    throw new Error(`Offset ${offset} + length ${length} exceeds data length ${data.length}`);
  }
  return data.slice(offset, offset + length);
}

/**
 * Convert byte array to 32-bit integer (little-endian)
 * @param {Uint8Array} bytes - 4-byte array
 * @returns {number} 32-bit integer value
 */
export function bytesToInt32(bytes) {
  if (bytes.length !== 4) {
    throw new Error('Expected 4 bytes for int32 conversion');
  }
  
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return view.getUint32(0, true); // true = little-endian
}

/**
 * Convert byte array to 16-bit integer (little-endian)
 * @param {Uint8Array} bytes - 2-byte array
 * @returns {number} 16-bit integer value
 */
export function bytesToInt16(bytes) {
  if (bytes.length !== 2) {
    throw new Error('Expected 2 bytes for int16 conversion');
  }
  
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return view.getUint16(0, true); // true = little-endian
}

/**
 * Debug utility: Log extracted data statistics
 * @param {Uint8Array} data - Extracted data
 * @param {string} label - Label for logging
 */
export function logDataStats(data, label = 'Data') {
  if (!data || data.length === 0) {
    console.warn(`[LSB Extractor] ${label}: No data extracted`);
    return;
  }
  
  console.log(`[LSB Extractor] ${label}:`, {
    length: data.length,
    firstBytes: Array.from(data.slice(0, 16)),
    lastBytes: Array.from(data.slice(-16))
  });
}
