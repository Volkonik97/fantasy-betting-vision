
/**
 * Parse a string value to a float safely
 */
export function safeParseFloat(value: any): number {
  if (value === undefined || value === null) return 0;
  
  if (typeof value === 'number') return value;
  
  if (typeof value === 'string') {
    const parsedValue = parseFloat(value);
    return isNaN(parsedValue) ? 0 : parsedValue;
  }
  
  return 0;
}

/**
 * Parse a string value to an integer safely
 */
export function safeParseInt(value: any): number {
  if (value === undefined || value === null) return 0;
  
  if (typeof value === 'number') return Math.floor(value);
  
  if (typeof value === 'string') {
    const parsedValue = parseInt(value, 10);
    return isNaN(parsedValue) ? 0 : parsedValue;
  }
  
  return 0;
}

/**
 * Parse a value to boolean safely
 */
export function parseBoolean(value: any): boolean {
  if (value === undefined || value === null) return false;
  
  if (typeof value === 'boolean') return value;
  
  if (typeof value === 'string') {
    const lowerValue = value.toLowerCase();
    return lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes';
  }
  
  if (typeof value === 'number') {
    return value === 1;
  }
  
  return false;
}

/**
 * Convert boolean to string representation
 */
export function booleanToString(value: boolean | string | undefined | null): string | null {
  if (value === undefined || value === null) return null;
  
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }
  
  return value;
}

/**
 * Prepares JSON data for database storage, ensuring it's in a proper format
 */
export function prepareJsonData(data: any): any {
  if (!data) return null;
  
  try {
    // If it's already a string, try to parse it
    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch {
        // If not valid JSON, return as is
        return data;
      }
    } 
    
    // If it's already an object, stringify and re-parse to ensure deep cloning
    // and to remove any circular references
    return JSON.parse(JSON.stringify(data));
  } catch (error) {
    console.error("Error preparing JSON data:", error);
    console.log("Original data type:", typeof data);
    
    if (typeof data === 'object') {
      console.log("Object keys:", Object.keys(data));
    }
    
    // Return null on error to avoid database issues
    return null;
  }
}
