
import { PlayerCSV } from '../csv/types';
import { Player } from '../models/types';
import { normalizeRoleName } from '../leagueData/assembler/modelConverter';

/**
 * Convert player CSV data to application Player objects
 */
export const convertPlayerData = (playersCSV: PlayerCSV[]): Player[] => {
  console.log(`Converting ${playersCSV.length} players from CSV data`);
  
  // Filter players without ID or name to avoid problems
  const validPlayers = playersCSV.filter(player => player.id && player.name);
  
  if (validPlayers.length < playersCSV.length) {
    console.warn(`Filtered out ${playersCSV.length - validPlayers.length} players with missing ID or name`);
  }
  
  // Log unique roles in the CSV for debugging
  const uniqueRoles = new Set<string>();
  validPlayers.forEach(player => {
    if (player.role) {
      uniqueRoles.add(player.role);
    }
  });
  console.log(`Unique roles in CSV: ${Array.from(uniqueRoles).join(', ')}`);
  
  return validPlayers.map(player => {
    // Ensure role is properly normalized
    const normalizedRole = normalizeRoleName(player.role || 'Mid');
    
    // Log any unexpected roles
    if (player.role && normalizedRole === 'Mid' && player.role.toLowerCase() !== 'mid') {
      console.warn(`Unknown role '${player.role}' for player ${player.name} normalized to 'Mid'`);
    }
    
    // Ensure team ID is set
    if (!player.team) {
      console.warn(`Player ${player.name} has no team ID`);
    }
    
    return {
      id: player.id,
      name: player.name,
      role: normalizedRole,
      image: player.image || '',
      team: player.team || '',
      kda: parseFloat(player.kda) || 0,
      csPerMin: parseFloat(player.csPerMin) || 0,
      damageShare: parseFloat(player.damageShare) || 0,
      championPool: player.championPool 
        ? (typeof player.championPool === 'string' 
          ? player.championPool.split(',').map(champ => champ.trim()) 
          : player.championPool)
        : []
    };
  });
};
