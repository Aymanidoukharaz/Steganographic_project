/**
 * Subtitle Cache
 * Performance optimization for decoded subtitles
 */

/**
 * Subtitle cache for performance optimization
 */
export class SubtitleCache {
  constructor(maxSize = 50) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.hits = 0;
    this.misses = 0;
  }
  
  /**
   * Get subtitle from cache by ID
   * @param {string} id - Subtitle ID
   * @returns {object|null} Cached subtitle or null
   */
  get(id) {
    if (this.cache.has(id)) {
      this.hits++;
      const entry = this.cache.get(id);
      entry.lastAccessed = Date.now();
      console.log('[Subtitle Cache] 🎯 Hit:', id);
      return entry.subtitle;
    }
    
    this.misses++;
    return null;
  }
  
  /**
   * Store subtitle in cache
   * @param {string} id - Subtitle ID
   * @param {object} subtitle - Subtitle object
   */
  set(id, subtitle) {
    // Check cache size limit
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }
    
    this.cache.set(id, {
      subtitle: subtitle,
      addedAt: Date.now(),
      lastAccessed: Date.now()
    });
    
    console.log('[Subtitle Cache] 💾 Stored:', id, `(${this.cache.size}/${this.maxSize})`);
  }
  
  /**
   * Check if subtitle is in cache
   * @param {string} id - Subtitle ID
   * @returns {boolean} True if cached
   */
  has(id) {
    return this.cache.has(id);
  }
  
  /**
   * Remove subtitle from cache
   * @param {string} id - Subtitle ID
   * @returns {boolean} True if removed
   */
  delete(id) {
    const removed = this.cache.delete(id);
    if (removed) {
      console.log('[Subtitle Cache] 🗑️ Removed:', id);
    }
    return removed;
  }
  
  /**
   * Clear entire cache
   */
  clear() {
    const size = this.cache.size;
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
    console.log('[Subtitle Cache] 🧹 Cleared:', size, 'entries');
  }
  
  /**
   * Evict oldest accessed entry
   */
  evictOldest() {
    let oldestId = null;
    let oldestTime = Infinity;
    
    for (const [id, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestId = id;
      }
    }
    
    if (oldestId) {
      this.delete(oldestId);
      console.log('[Subtitle Cache] ⏰ Evicted oldest:', oldestId);
    }
  }
  
  /**
   * Get cache statistics
   * @returns {object} Cache stats
   */
  getStats() {
    const hitRate = this.hits + this.misses > 0
      ? (this.hits / (this.hits + this.misses) * 100).toFixed(2)
      : 0;
    
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hits: this.hits,
      misses: this.misses,
      hitRate: `${hitRate}%`
    };
  }
  
  /**
   * Get all cached subtitles sorted by time
   * @returns {Array<object>} Sorted subtitle array
   */
  getAllSorted() {
    const subtitles = Array.from(this.cache.values())
      .map(entry => entry.subtitle);
    
    return subtitles.sort((a, b) => a.startTime - b.startTime);
  }
  
  /**
   * Get subtitles within time range
   * @param {number} startTime - Range start time
   * @param {number} endTime - Range end time
   * @returns {Array<object>} Matching subtitles
   */
  getByTimeRange(startTime, endTime) {
    const matching = [];
    
    for (const entry of this.cache.values()) {
      const sub = entry.subtitle;
      
      // Check if subtitle overlaps with range
      if (sub.startTime <= endTime && sub.endTime >= startTime) {
        matching.push(sub);
      }
    }
    
    return matching.sort((a, b) => a.startTime - b.startTime);
  }
}

/**
 * Global subtitle cache instance
 */
export const globalSubtitleCache = new SubtitleCache(50);

/**
 * Timing-based cache for current subtitle
 * Optimizes repeated lookups at same timestamp
 */
export class CurrentSubtitleCache {
  constructor() {
    this.current = null;
    this.timestamp = -1;
    this.validDuration = 100; // ms - cache validity
  }
  
  /**
   * Get current subtitle if still valid
   * @param {number} timestamp - Current timestamp
   * @returns {object|null} Current subtitle or null
   */
  get(timestamp) {
    // Check if cache is still valid
    if (this.current && 
        Math.abs(timestamp - this.timestamp) < this.validDuration) {
      return this.current;
    }
    
    return null;
  }
  
  /**
   * Update current subtitle
   * @param {object} subtitle - New current subtitle
   * @param {number} timestamp - Associated timestamp
   */
  set(subtitle, timestamp) {
    this.current = subtitle;
    this.timestamp = timestamp;
  }
  
  /**
   * Clear current cache
   */
  clear() {
    this.current = null;
    this.timestamp = -1;
  }
  
  /**
   * Check if timestamp is within current subtitle
   * @param {number} timestamp - Timestamp to check
   * @returns {boolean} True if within current subtitle timing
   */
  isWithinCurrent(timestamp) {
    if (!this.current) return false;
    
    return timestamp >= this.current.startTime && 
           timestamp <= this.current.endTime;
  }
}

/**
 * Global current subtitle cache
 */
export const globalCurrentCache = new CurrentSubtitleCache();
