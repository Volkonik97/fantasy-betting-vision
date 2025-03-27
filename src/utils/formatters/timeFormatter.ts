
/**
 * Time formatting utilities for consistent display across the application
 */

/**
 * Formats a time value in seconds to a MM:SS display format
 * Handles various input formats and normalizes them
 */
export const formatTime = (seconds: number | string): string => {
  if (!seconds) return "00:00";
  
  // Convert string to number if needed
  let secondsNum = typeof seconds === 'string' ? parseFloat(seconds) : seconds;
  
  if (isNaN(secondsNum)) return "00:00";
  
  // Normalize time values based on common patterns
  if (secondsNum > 3600) {
    // If value is suspiciously large (over 1 hour), assume it's in milliseconds
    secondsNum = secondsNum / 1000;
  } else if (secondsNum < 10) {
    // If value is tiny, assume it's in minutes and convert to seconds
    secondsNum = secondsNum * 60;
  }
  
  // If still very large, normalize to a reasonable game length
  if (secondsNum > 3600) {
    secondsNum = secondsNum % 3600; // Take just the seconds part
    if (secondsNum < 60) secondsNum = 1800; // Default to 30 minutes if too small
  }
  
  const minutes = Math.floor(secondsNum / 60);
  const remainingSeconds = Math.floor(secondsNum % 60);
  
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

/**
 * Formats a time value to be used for statistical calculations 
 * (returns normalized seconds)
 */
export const normalizeTimeValue = (seconds: number | string): number => {
  if (!seconds) return 0;
  
  // Convert string to number if needed
  let secondsNum = typeof seconds === 'string' ? parseFloat(seconds) : seconds;
  
  if (isNaN(secondsNum)) return 0;
  
  // Apply normalization logic similar to formatTime
  if (secondsNum > 3600) {
    secondsNum = secondsNum / 1000;
  } else if (secondsNum < 10) {
    secondsNum = secondsNum * 60;
  }
  
  // If still very large, normalize
  if (secondsNum > 3600) {
    secondsNum = secondsNum % 3600;
    if (secondsNum < 60) secondsNum = 1800;
  }
  
  return secondsNum;
};
