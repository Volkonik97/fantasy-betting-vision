
/**
 * Utility functions for league data processing
 */

/**
 * Prepares JSON data by parsing strings or returning objects directly
 */
export const prepareJsonData = (data: any): any => {
  if (!data) return null;
  
  try {
    // If it's already an object, return it
    if (typeof data === 'object' && !Array.isArray(data)) {
      return data;
    }
    
    // If it's a string, try to parse it
    if (typeof data === 'string') {
      return JSON.parse(data);
    }
    
    return data;
  } catch (error) {
    console.error("Error preparing JSON data:", error);
    return null;
  }
};

/**
 * Safely convert a value to a number, returning 0 if conversion fails
 */
export const safeNumber = (value: any): number => {
  if (value === null || value === undefined) return 0;
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

/**
 * Safely convert a value to a boolean
 */
export const safeBoolean = (value: any): boolean => {
  if (typeof value === 'boolean') return value;
  if (value === 1 || value === '1' || value === 'true') return true;
  return false;
};

/**
 * Safely get an array element or return a default value
 */
export const safeArrayElement = <T>(arr: T[] | undefined, index: number, defaultValue: T): T => {
  if (!arr || !Array.isArray(arr) || index < 0 || index >= arr.length) {
    return defaultValue;
  }
  return arr[index] ?? defaultValue;
};

/**
 * Calculate average from an array of numbers, ignoring NaN values
 */
export const calculateAverage = (values: number[]): number => {
  if (!values || values.length === 0) return 0;
  
  const validValues = values.filter(v => !isNaN(v));
  if (validValues.length === 0) return 0;
  
  const sum = validValues.reduce((acc, val) => acc + val, 0);
  return sum / validValues.length;
};

/**
 * Format a percentage value for display
 */
export const formatPercentage = (value: number): string => {
  return `${Math.round(value * 100)}%`;
};
