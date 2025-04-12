
import { PostgrestError } from "@supabase/supabase-js";

/**
 * Helper function to safely handle Supabase database errors
 */
export const handleDatabaseError = (error: PostgrestError | null, defaultValue: any = null): any => {
  if (!error) return null;
  
  console.error("Database error:", error.message, error);
  
  // Use type assertion to access error properties even in case of errors
  return {
    message: error.message,
    details: error.details,
    hint: error.hint,
    code: error.code,
    defaultValue
  };
};

/**
 * Type assertion helper for database results
 */
export const assertDatabaseResult = <T>(data: any, defaultValue: T): T => {
  if (!data) return defaultValue;
  return data as T;
};

/**
 * Safe type assertion for database results that might be errors
 */
export const safelyGetData = <T>(data: any, error: PostgrestError | null, defaultValue: T): T => {
  if (error || !data) {
    if (error) {
      console.error("Database error:", error.message, error);
    }
    return defaultValue;
  }
  return data as T;
};
