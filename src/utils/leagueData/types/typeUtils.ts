
/**
 * Helper utilities for type conversion and management
 */

// Helper function to prepare JSON data
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
