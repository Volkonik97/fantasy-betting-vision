
// Re-export team-related functionality from modular files
export { getTeams } from './teams/getTeams';
export { getTeamById } from './teams/getTeamById';
export { saveTeams } from './teams/saveTeams';

// Fonction utilitaire pour vider le cache
export const clearTeamsCache = () => {
  console.log("Cette fonction ne fait plus rien car le cache a été supprimé");
  // Le cache a été supprimé, cette fonction reste pour compatibilité
};
