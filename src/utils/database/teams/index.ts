
// Re-export functions from the team-related files
import { getTeams } from './getTeams';
import { getTeamById } from './getTeamById';
import { saveTeams } from './saveTeams';
import { 
  getTeamNameFromCache, 
  getTeamsFromCache, 
  isTeamsCacheValid, 
  setTeamsCache, 
  updateTeamInCache, 
  clearTeamsCache 
} from './teamCache';

export {
  // Team data functions
  getTeams,
  getTeamById,
  saveTeams,
  
  // Team cache functions
  getTeamNameFromCache,
  getTeamsFromCache,
  isTeamsCacheValid,
  setTeamsCache,
  updateTeamInCache,
  clearTeamsCache
};
