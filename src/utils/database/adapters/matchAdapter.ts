
/**
 * Adapter module to handle database schema and model mismatches.
 * This helps with type safety while allowing us to work with both database and application models.
 * 
 * @deprecated Use the new structure in 'match/' directory instead
 */

// Re-export all match adapter functionality from the new files
export { 
  RawDatabaseMatch,
  adaptMatchFromDatabase,
  adaptMatchForDatabase,
  booleanToString,
  parseGameNumber
} from './match';
