
// Re-export team-related functionality from modular files
export { getTeams } from './teams/getTeams';
export { getTeamById } from './teams/getTeamById';
export { saveTeams } from './teams/saveTeams';

// Function that previously cleared cache now logs that cache has been removed
export const clearTeamsCache = () => {
  console.log("Cache has been removed from the system");
};
