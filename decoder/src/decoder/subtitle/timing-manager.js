/**
 * Timing Manager
 * Manages subtitle timing and display logic
 */

import { shouldDisplaySubtitle } from '../steganography/timing-sync.js';

/**
 * Subtitle timing manager
 * Handles timing logic and active subtitle tracking
 */
export class SubtitleTimingManager {
  constructor() {
    this.activeSubtitle = null;
    this.subtitleQueue = [];
    this.displayHistory = [];
    this.maxHistorySize = 20;
  }
  
  /**
   * Add subtitle to queue
   * @param {object} subtitle - Subtitle to add
   */
  addSubtitle(subtitle) {
    if (!subtitle) return;
    
    // Avoid duplicates
    const exists = this.subtitleQueue.some(s => s.id === subtitle.id);
    if (exists) {
      console.log('[Timing Manager] Subtitle already queued:', subtitle.id);
      return;
    }
    
    this.subtitleQueue.push(subtitle);
    
    // Sort by start time
    this.subtitleQueue.sort((a, b) => a.startTime - b.startTime);
    
    console.log('[Timing Manager] Added to queue:', {
      id: subtitle.id,
      queueSize: this.subtitleQueue.length
    });
  }
  
  /**
   * Update active subtitle based on current timestamp
   * @param {number} currentTime - Current timestamp
   * @returns {object|null} Active subtitle or null
   */
  update(currentTime) {
    // Check if current subtitle is still active
    if (this.activeSubtitle && 
        shouldDisplaySubtitle(this.activeSubtitle, currentTime)) {
      return this.activeSubtitle;
    }
    
    // Find new active subtitle from queue
    const newActive = this.subtitleQueue.find(sub => 
      shouldDisplaySubtitle(sub, currentTime)
    );
    
    if (newActive && newActive !== this.activeSubtitle) {
      this.setActiveSubtitle(newActive);
    } else if (!newActive && this.activeSubtitle) {
      this.clearActiveSubtitle();
    }
    
    return this.activeSubtitle;
  }
  
  /**
   * Set active subtitle
   * @param {object} subtitle - Subtitle to set as active
   */
  setActiveSubtitle(subtitle) {
    // Record previous subtitle in history
    if (this.activeSubtitle) {
      this.displayHistory.push({
        subtitle: this.activeSubtitle,
        endedAt: Date.now()
      });
      
      // Limit history size
      if (this.displayHistory.length > this.maxHistorySize) {
        this.displayHistory.shift();
      }
    }
    
    this.activeSubtitle = subtitle;
    
    console.log('[Timing Manager] 🎬 Active subtitle:', {
      id: subtitle.id,
      text: subtitle.text.substring(0, 40),
      startTime: subtitle.startTime,
      endTime: subtitle.endTime
    });
  }
  
  /**
   * Clear active subtitle
   */
  clearActiveSubtitle() {
    if (this.activeSubtitle) {
      console.log('[Timing Manager] ⏹️ Cleared active subtitle:', this.activeSubtitle.id);
      this.activeSubtitle = null;
    }
  }
  
  /**
   * Get currently active subtitle
   * @returns {object|null} Active subtitle or null
   */
  getActive() {
    return this.activeSubtitle;
  }
  
  /**
   * Clear all state
   */
  reset() {
    this.activeSubtitle = null;
    this.subtitleQueue = [];
    this.displayHistory = [];
    console.log('[Timing Manager] 🔄 Reset');
  }
  
  /**
   * Remove old subtitles from queue
   * @param {number} currentTime - Current timestamp
   * @param {number} threshold - Time threshold (default 10 seconds)
   */
  cleanupOldSubtitles(currentTime, threshold = 10000) {
    const before = this.subtitleQueue.length;
    
    this.subtitleQueue = this.subtitleQueue.filter(sub => 
      sub.endTime > currentTime - threshold
    );
    
    const removed = before - this.subtitleQueue.length;
    if (removed > 0) {
      console.log('[Timing Manager] 🧹 Cleaned up', removed, 'old subtitles');
    }
  }
  
  /**
   * Get upcoming subtitles
   * @param {number} currentTime - Current timestamp
   * @param {number} lookahead - Lookahead time in ms (default 5 seconds)
   * @returns {Array<object>} Upcoming subtitles
   */
  getUpcoming(currentTime, lookahead = 5000) {
    return this.subtitleQueue.filter(sub => 
      sub.startTime > currentTime && 
      sub.startTime <= currentTime + lookahead
    );
  }
  
  /**
   * Get statistics
   * @returns {object} Timing manager stats
   */
  getStats() {
    return {
      activeSubtitle: this.activeSubtitle ? {
        id: this.activeSubtitle.id,
        text: this.activeSubtitle.text.substring(0, 30)
      } : null,
      queueSize: this.subtitleQueue.length,
      historySize: this.displayHistory.length
    };
  }
}

/**
 * Global timing manager instance
 */
export const globalTimingManager = new SubtitleTimingManager();
