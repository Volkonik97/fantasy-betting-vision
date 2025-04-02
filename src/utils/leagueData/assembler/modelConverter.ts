
import { Team, Player, PlayerRole } from '../../models/types';

/**
 * Helper function to convert team CSV to team object
 */
export function teamToTeamObject(teamCsv: any): Team {
  return {
    id: teamCsv.id,
    name: teamCsv.name,
    logo: teamCsv.logo,
    region: teamCsv.region,
    winRate: parseFloat(teamCsv.winRate) || 0,
    blueWinRate: parseFloat(teamCsv.blueWinRate) || 0,
    redWinRate: parseFloat(teamCsv.redWinRate) || 0,
    averageGameTime: parseFloat(teamCsv.averageGameTime) || 0,
    players: [] // Will be filled later
  };
}

/**
 * Normalizes role names to standard format
 */
export function normalizeRoleName(role?: string): PlayerRole {
  if (!role) return 'Mid'; // Default to Mid if role is undefined or empty
  
  // Convert to string in case it's a number or other type, then normalize
  const normalizedRole = String(role).toLowerCase().trim();
  
  // Top lane variations
  if (['top', 'toplane', 'top lane', 'toplaner', 'toplaner', 'top laner', 'toplar', 't', 'ㅆ', 
       'tpplanee', 'tplaner', 'topl', 'toplne', 'toplaine', 'top-laner', 'topln', 'tope', 'to', 
       'tp', '1', 'top lane'].includes(normalizedRole)) {
    return 'Top';
  }
  
  // Jungle variations
  if (['jungle', 'jng', 'jgl', 'jg', 'jungler', 'jgler', 'jung', 'j', '2'].includes(normalizedRole)) {
    return 'Jungle';
  }
  
  // Mid lane variations
  if (['mid', 'middle', 'midlane', 'mid lane', 'midlaner', 'middle lane', 'middler', 'midlar', 'm', '3'].includes(normalizedRole)) {
    return 'Mid';
  }
  
  // ADC/Bot lane variations
  if (['adc', 'bot', 'bottom', 'carry', 'botlane', 'bot lane', 'adcarry', 'ad carry', 
       'botlaner', 'ad', 'marksman', 'bot laner', 'a', 'b', '4'].includes(normalizedRole)) {
    return 'ADC';
  }
  
  // Support variations
  if (['support', 'sup', 'supp', 'soutien', 'supporter', 'support lane', 'sp', 's', '5'].includes(normalizedRole)) {
    return 'Support';
  }
  
  // If the role is already normalized, return it directly
  if (role === 'Top' || role === 'Jungle' || role === 'Mid' || role === 'ADC' || role === 'Support') {
    return role as PlayerRole;
  }
  
  // Log unknown roles for debugging
  console.warn(`Unknown role encountered: "${role}" (normalized: "${normalizedRole}"), defaulting to Mid`);
  
  // Default to Mid if role is unknown
  return 'Mid';
}

/**
 * Helper function to convert player CSV to player object
 */
export function playerToPlayerObject(playerCsv: any): Player {
  // Normalize the role
  const normalizedRole = normalizeRoleName(playerCsv.role);
  
  return {
    id: playerCsv.id,
    name: playerCsv.name,
    role: normalizedRole,
    image: playerCsv.image,
    team: playerCsv.team,
    kda: parseFloat(playerCsv.kda) || 0,
    csPerMin: parseFloat(playerCsv.csPerMin) || 0,
    damageShare: parseFloat(playerCsv.damageShare) || 0,
    championPool: playerCsv.championPool ? playerCsv.championPool.split(',').map((champ: string) => champ.trim()) : []
  };
}
