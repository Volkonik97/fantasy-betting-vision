
// Simple re-export logo-related functions

// Import from source files directly
import { findTeamByName } from './teamMatcher';
import { uploadTeamLogo as uploadLogo } from './logoUploader';
import { getTeamLogoUrl as getLogo } from './logoRetriever';
import { BUCKET_NAME } from './constants';

// Re-export to avoid circular dependencies
export const uploadTeamLogo = uploadLogo;
export const getTeamLogoUrl = getLogo;

// Re-export other utils
export {
  findTeamByName,
  BUCKET_NAME
};
