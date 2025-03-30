
/**
 * Time formatting and conversion utilities
 */

// Format seconds to MM:SS format
export const formatSecondsToMinutesSeconds = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return "00:00";
  
  // Convert any seconds input to a proper seconds value
  let normalizedSeconds = seconds;
  
  // If value is very small (like 0.55), assume it's in minutes and convert to seconds
  if (seconds < 5) {
    normalizedSeconds = seconds * 60;
  } 
  // If value is reasonable for minutes (5-60), convert to seconds
  else if (seconds >= 5 && seconds < 100) {
    normalizedSeconds = seconds * 60;
  }
  // If value is very large (like 1705524.72), assume it's in milliseconds
  else if (seconds > 3600) {
    normalizedSeconds = seconds / 1000;
  }
  
  // Safety check: if still too large, cap at reasonable game length
  if (normalizedSeconds > 3600) {
    normalizedSeconds = 3599; // Max at 59:59
  }
  
  const minutes = Math.floor(normalizedSeconds / 60);
  const remainingSeconds = Math.floor(normalizedSeconds % 60);
  
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

// Convert seconds to minutes (as a number) for averaging
export const secondsToMinutes = (seconds: number): number => {
  if (!seconds || isNaN(seconds)) return 0;
  
  // Apply similar logic as formatSecondsToMinutesSeconds to normalize time values
  let normalizedSeconds = seconds;
  
  // If value is very small (like 0.55), assume it's in minutes and convert to seconds
  if (seconds < 5) {
    normalizedSeconds = seconds * 60;
  } 
  // If value is reasonable for minutes (5-60), convert to seconds
  else if (seconds >= 5 && seconds < 100) {
    normalizedSeconds = seconds * 60;
  }
  // If value is very large (like 1705524.72), assume it's in milliseconds
  else if (seconds > 3600) {
    normalizedSeconds = seconds / 1000;
  }
  
  // Safety check: if still too large, cap at reasonable game length
  if (normalizedSeconds > 3600) {
    normalizedSeconds = 3599;
  }
  
  // Return normalized seconds (not minutes, despite the function name)
  return normalizedSeconds;
};
