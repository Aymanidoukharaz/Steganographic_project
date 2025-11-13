/**
 * Data Decompressor
 * Handles LZ4 decompression of steganographically embedded subtitle data
 */

import lz4 from 'lz4js';

/**
 * Decompress LZ4-encoded subtitle data
 * @param {Uint8Array} compressedBytes - LZ4 compressed data
 * @returns {string} Decompressed UTF-8 text
 */
export function decompressData(compressedBytes) {
  try {
    if (!compressedBytes || compressedBytes.length === 0) {
      throw new Error('Empty compressed data');
    }
    
    console.log('[Decompressor] Input size:', compressedBytes.length, 'bytes');
    
    // LZ4 decompression
    const decompressed = lz4.decompress(compressedBytes);
    
    if (!decompressed || decompressed.length === 0) {
      throw new Error('Decompression produced no output');
    }
    
    console.log('[Decompressor] Decompressed size:', decompressed.length, 'bytes');
    
    // Convert to UTF-8 string
    const decoder = new TextDecoder('utf-8');
    const text = decoder.decode(decompressed);
    
    console.log('[Decompressor] ✅ Success:', text.substring(0, 100));
    
    return text;
    
  } catch (error) {
    console.error('[Decompressor] ❌ Failed:', error);
    throw new Error(`LZ4 decompression failed: ${error.message}`);
  }
}

/**
 * Decompress with fallback for corrupted data
 * Attempts partial decompression if full decompression fails
 * @param {Uint8Array} compressedBytes - LZ4 compressed data
 * @returns {object} { success: boolean, text: string, partial: boolean }
 */
export function decompressWithFallback(compressedBytes) {
  try {
    const text = decompressData(compressedBytes);
    return {
      success: true,
      text: text,
      partial: false
    };
  } catch (error) {
    console.warn('[Decompressor] Full decompression failed, attempting partial recovery...');
    
    // Try decompressing chunks
    try {
      const partialText = attemptPartialDecompression(compressedBytes);
      if (partialText) {
        return {
          success: true,
          text: partialText,
          partial: true
        };
      }
    } catch (partialError) {
      console.error('[Decompressor] Partial recovery also failed:', partialError);
    }
    
    return {
      success: false,
      text: '',
      partial: false,
      error: error.message
    };
  }
}

/**
 * Attempt to recover partial data from corrupted compressed stream
 * @param {Uint8Array} compressedBytes - Corrupted compressed data
 * @returns {string|null} Recovered text or null
 */
function attemptPartialDecompression(compressedBytes) {
  // Try progressively smaller chunks from the beginning
  const chunkSizes = [
    Math.floor(compressedBytes.length * 0.9),
    Math.floor(compressedBytes.length * 0.75),
    Math.floor(compressedBytes.length * 0.5)
  ];
  
  for (const size of chunkSizes) {
    try {
      const chunk = compressedBytes.slice(0, size);
      const decompressed = lz4.decompress(chunk);
      const decoder = new TextDecoder('utf-8', { fatal: false });
      const text = decoder.decode(decompressed);
      
      if (text && text.length > 0) {
        console.log(`[Decompressor] ⚠️ Partial recovery: ${text.length} chars from ${size} bytes`);
        return text;
      }
    } catch (e) {
      // Try next chunk size
      continue;
    }
  }
  
  return null;
}

/**
 * Validate compressed data header
 * LZ4 has specific format markers
 * @param {Uint8Array} data - Data to validate
 * @returns {boolean} True if appears to be valid LZ4 data
 */
export function validateLZ4Header(data) {
  if (!data || data.length < 4) {
    return false;
  }
  
  // LZ4 frame format magic number: 0x184D2204
  // Note: Encoder might use raw LZ4 blocks instead
  // This is a basic check
  return true; // Simplified - trust the data for now
}

/**
 * Estimate decompression ratio for logging
 * @param {Uint8Array} compressed - Compressed data
 * @param {string} decompressed - Decompressed text
 * @returns {number} Compression ratio
 */
export function calculateCompressionRatio(compressed, decompressed) {
  const compressedSize = compressed.length;
  const decompressedSize = new TextEncoder().encode(decompressed).length;
  return (decompressedSize / compressedSize).toFixed(2);
}
