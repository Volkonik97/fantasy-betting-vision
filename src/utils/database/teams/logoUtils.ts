
// Re-export logo-related functions from a central file

// Import from source files directly
import { findTeamByName } from './teamMatcher';
import { uploadTeamLogo as uploadLogo } from './logoUploader';
import { getTeamLogoUrl as getLogo } from './logoRetriever';
import { BUCKET_NAME } from './constants';
import { 
  getTeamLogoFromCache, 
  cacheTeamLogo, 
  handleLogoError,
  clearLogoCache,
  preloadTeamLogos
} from './images/logoCache';

// Re-export to avoid circular dependencies
export const uploadTeamLogo = uploadLogo;
export const getTeamLogoUrl = getLogo;

// Re-export logo cache functions
export {
  getTeamLogoFromCache,
  cacheTeamLogo,
  handleLogoError,
  clearLogoCache,
  preloadTeamLogos,
  findTeamByName,
  BUCKET_NAME
};
