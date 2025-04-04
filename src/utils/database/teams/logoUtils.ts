
// Re-export logo-related functions from a central file

// Import from source files directly
import { findTeamByName } from './teamMatcher';
import { uploadTeamLogo as uploadLogo } from './logoUploader';
import { getTeamLogoUrl as getLogo } from './logoRetriever';
import { TEAM_VALIANT_ID, VALIANT_LOGO_PATH, BUCKET_NAME } from './constants';

// Re-export to avoid circular dependencies
export const uploadTeamLogo = uploadLogo;
export const getTeamLogoUrl = getLogo;

// Re-export all other logo-related functions and constants
export {
  findTeamByName,
  TEAM_VALIANT_ID,
  VALIANT_LOGO_PATH,
  BUCKET_NAME
};
