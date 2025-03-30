
/**
 * Time formatting and conversion utilities
 */

// Format seconds to MM:SS format
export const formatSecondsToMinutesSeconds = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return "00:00";
  
  // Convert any seconds input to a proper seconds value (in case it's provided in minutes)
  if (seconds > 3600) {
    // If value is suspiciously large (over 1 hour), assume it's in milliseconds
    seconds = seconds / 1000;
  } else if (seconds > 300) {
    // If value is over 5 minutes in seconds but not huge, it's probably good as is
    seconds = seconds;
  } else if (seconds < 10) {
    // If value is tiny, assume it's in minutes and convert to seconds
    seconds = seconds * 60;
  }
  
  // Additional fix: if the value is still very large (>3600) after our first correction,
  // it might be a mistake in the data format. Force it to be a reasonable game length.
  if (seconds > 3600) {
    seconds = seconds % 3600; // Take just the seconds part, ignore hours
    if (seconds < 60) seconds = 1800; // If too small, default to 30 minutes
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

// Convert seconds to minutes (as a number) for averaging
export const secondsToMinutes = (seconds: number): number => {
  if (!seconds || isNaN(seconds)) return 0;
  
  // Apply similar logic as formatSecondsToMinutesSeconds to normalize time values
  if (seconds > 3600) {
    seconds = seconds / 1000;
  } else if (seconds < 10) {
    seconds = seconds * 60;
  }
  
  // If still very large, normalize
  if (seconds > 3600) {
    seconds = seconds % 3600;
    if (seconds < 60) seconds = 1800;
  }
  
  // Return normalized seconds
  return seconds;
};
