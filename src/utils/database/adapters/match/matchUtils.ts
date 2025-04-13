
/**
 * Utility functions for match data conversion
 */

/**
 * Safely convert any value to a boolean in string form for database storage
 */
export const booleanToString = (value: any): string | null => {
  if (value === undefined || value === null) return null;
  
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }
  
  if (typeof value === 'string') {
    const lowercaseValue = value.toLowerCase().trim();
    if (['true', '1', 'yes', 'oui', 't', 'y'].includes(lowercaseValue)) {
      return 'true';
    }
    if (['false', '0', 'no', 'non', 'f', 'n'].includes(lowercaseValue)) {
      return 'false';
    }
    
    // If it doesn't match any boolean pattern, return it as is
    // It might be an ID or other string value
    return value;
  }
  
  if (typeof value === 'number') {
    return value === 1 ? 'true' : 'false';
  }
  
  return null;
};

/**
 * Convert a game number to a proper number type
 * @param gameNumber The game number from match data
 * @returns A number or undefined
 */
export const parseGameNumber = (gameNumber: any): number | undefined => {
  if (gameNumber === undefined) return undefined;
  
  if (typeof gameNumber === 'number') {
    return gameNumber;
  }
  
  if (typeof gameNumber === 'string') {
    const parsed = parseInt(gameNumber, 10);
    return isNaN(parsed) ? undefined : parsed;
  }
  
  return undefined;
};
