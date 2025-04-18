
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
  
  // Count players by team and role before normalization
  const playersByTeam = validPlayers.reduce((acc, player) => {
    const teamId = player.team || 'unknown';
    if (!acc[teamId]) {
      acc[teamId] = { total: 0, roles: {} };
    }
    acc[teamId].total++;
    
    const role = player.role || 'unknown';
    acc[teamId].roles[role] = (acc[teamId].roles[role] || 0) + 1;
    
    return acc;
  }, {} as Record<string, { total: number, roles: Record<string, number> }>);
  
  console.log("Players by team and role before normalization:", playersByTeam);
  
  const normalizedPlayers = validPlayers.map(player => {
    // Ensure role is properly normalized
    const normalizedRole = normalizeRoleName(player.role || 'Mid');
    
    // Log any unexpected roles
    if (player.role && normalizedRole !== player.role) {
      console.log(`Normalized role '${player.role}' to '${normalizedRole}' for player ${player.name}`);
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
      killParticipation: parseFloat(player.killParticipation || '0') || 0, // Handle missing killParticipation field
      championPool: player.championPool 
        ? (typeof player.championPool === 'string' 
          ? player.championPool.split(',').map(champ => champ.trim()) 
          : player.championPool)
        : []
    };
  });
  
  // Count players by team and role after normalization
  const normalizedPlayersByTeam = normalizedPlayers.reduce((acc, player) => {
    const teamId = player.team || 'unknown';
    if (!acc[teamId]) {
      acc[teamId] = { total: 0, roles: {} };
    }
    acc[teamId].total++;
    
    acc[teamId].roles[player.role] = (acc[teamId].roles[player.role] || 0) + 1;
    
    return acc;
  }, {} as Record<string, { total: number, roles: Record<string, number> }>);
  
  console.log("Players by team and role after normalization:", normalizedPlayersByTeam);
  
  return normalizedPlayers;
};
