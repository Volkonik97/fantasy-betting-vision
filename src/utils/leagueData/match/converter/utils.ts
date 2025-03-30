
/**
 * Safely convert a value to string, handling undefined and null values
 */
export function safeConvertToString(value: any): string {
  if (value === undefined || value === null) {
    return '';
  }
  return String(value);
}

/**
 * Check if value exists and is a valid number or string
 */
export function hasValue(value: any): boolean {
  return value !== undefined && value !== null && value !== '';
}
