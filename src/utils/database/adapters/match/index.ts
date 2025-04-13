
/**
 * Match adapter module
 * Re-exports all match adapter functionality from subdirectories
 */

export { RawDatabaseMatch } from './matchTypes';
export { adaptMatchFromDatabase } from './matchDbToAppAdapter';
export { adaptMatchForDatabase } from './matchAppToDbAdapter';
export { booleanToString, parseGameNumber } from './matchUtils';
