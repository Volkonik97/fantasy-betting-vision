
/**
 * Utility function to safely convert any value to a boolean string representation (team ID or null)
 * Helps with consistently handling boolean values in database
 */
export function booleanToString(value: any): string | null {
  if (value === undefined || value === null) return null;
  
  // If it's already a string that looks like a team ID, return it
  if (typeof value === 'string' && value !== 'true' && value !== 'false' 
      && value !== '1' && value !== '0' && value !== 'yes' && value !== 'no') {
    return value;
  }
  
  // Handle boolean values
  if (typeof value === 'boolean') return value ? 'true' : null;
  
  // Handle string values like "true", "1", "yes", etc.
  if (typeof value === 'string') {
    const lowerValue = value.toLowerCase().trim();
    if (['true', '1', 'yes', 'oui', 't', 'y'].includes(lowerValue)) return 'true';
    if (['false', '0', 'no', 'non', 'f', 'n'].includes(lowerValue)) return null;
  }
  
  // Handle numeric values (1 = true, 0 = false)
  if (typeof value === 'number') return value === 1 ? 'true' : null;
  
  // Default case
  return null;
}

// Exporter les types et interfaces directement dans ce fichier
export interface PicksAndBans {
  [key: string]: any;
}

export type GameRole = 'top' | 'jungle' | 'mid' | 'adc' | 'support' | 'unknown';

/**
 * Safely parse a float value
 */
export function safeParseFloat(value: any): number {
  if (value === undefined || value === null) return 0;
  
  if (typeof value === 'number') return value;
  
  if (typeof value === 'string') {
    // Replace commas with points for international number formats
    const normalizedValue = value.replace(',', '.');
    const result = parseFloat(normalizedValue);
    return isNaN(result) ? 0 : result;
  }
  
  return 0;
}

/**
 * Safely parse an integer value with special handling for boolean-like values
 */
export function safeParseInt(value: any): number {
  if (value === undefined || value === null) return 0;
  
  if (typeof value === 'number') return Math.round(value);
  
  // Handle boolean values
  if (value === true) return 1;
  if (value === false) return 0;
  
  if (typeof value === 'string') {
    // Handle boolean-like string values
    const lowerValue = value.toLowerCase().trim();
    if (['true', 'yes', 'oui', 't', 'y'].includes(lowerValue)) return 1;
    if (['false', 'no', 'non', 'f', 'n'].includes(lowerValue)) return 0;
    
    // Try to parse as integer
    const result = parseInt(value, 10);
    return isNaN(result) ? 0 : result;
  }
  
  return 0;
}

/**
 * Helper function to prepare JSON data for storage in Supabase
 */
export function prepareJsonData(data: any): any {
  if (!data) return null;
  
  // If already a string, make sure it's valid JSON
  if (typeof data === 'string') {
    try {
      // Try to parse it to ensure it's valid JSON
      const parsed = JSON.parse(data);
      return parsed; // Return the parsed object
    } catch (e) {
      console.error("Invalid JSON string:", e);
      return null;
    }
  }
  
  // If it's already an object, return it directly
  return data;
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

// Exporter aussi les interfaces/types des autres fichiers
export * from './types/gameTracker';
export * from './types/teamStats';
export * from './types/playerStats';
export * from './types/picksAndBans';
