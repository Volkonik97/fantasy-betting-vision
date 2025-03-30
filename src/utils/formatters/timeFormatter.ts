
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
  // If value is very small (like 0.55), assume it's in minutes and convert to seconds
  if (secondsNum < 5) {
    secondsNum = secondsNum * 60;
  } 
  // If value is reasonable for minutes (5-60), convert to seconds
  else if (secondsNum >= 5 && secondsNum < 100) {
    secondsNum = secondsNum * 60;
  }
  // If value is very large (like 1705524.72), assume it's in milliseconds
  else if (secondsNum > 3600) {
    secondsNum = secondsNum / 1000;
  }
  
  // Safety check: if still too large, cap at reasonable game length
  if (secondsNum > 3600) {
    secondsNum = 3599; // Max at 59:59
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
  // If value is very small (like 0.55), assume it's in minutes and convert to seconds
  if (secondsNum < 5) {
    secondsNum = secondsNum * 60;
  } 
  // If value is reasonable for minutes (5-60), convert to seconds
  else if (secondsNum >= 5 && secondsNum < 100) {
    secondsNum = secondsNum * 60;
  }
  // If value is very large (like 1705524.72), assume it's in milliseconds
  else if (secondsNum > 3600) {
    secondsNum = secondsNum / 1000;
  }
  
  // Safety check: if still too large, cap at reasonable game length
  if (secondsNum > 3600) {
    secondsNum = 3599; // Max at 59:59
  }
  
  return secondsNum;
};
