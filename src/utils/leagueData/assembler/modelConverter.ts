
import { Team, Player } from '../../models/types';

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
export function normalizeRoleName(role: string): 'Top' | 'Jungle' | 'Mid' | 'ADC' | 'Support' {
  if (!role) return 'Mid'; // Default to Mid if role is undefined or empty
  
  // Convert to string in case it's a number or other type, then normalize
  const normalizedRole = String(role).toLowerCase().trim();
  
  // Enhanced role mappings with more variations for Top lane
  if (['top', 'toplane', 'top lane', 'toplaner', 'toplaner', 'top laner', 'toplar', 't', 'ㅆ', 'tpplanee', 'tplaner', 'topl', 'toplne', 'toplaine', 'toplaine', 'top-laner', 'topln', 'top lane', 'tope', 'to', 'tp', '1'].includes(normalizedRole)) {
    return 'Top';
  }
  
  if (['jungle', 'jng', 'jgl', 'jg', 'jungler', 'jgler', 'jung', 'j', '2'].includes(normalizedRole)) {
    return 'Jungle';
  }
  
  if (['mid', 'middle', 'midlane', 'mid lane', 'midlaner', 'middle lane', 'middler', 'midlar', 'm', '3'].includes(normalizedRole)) {
    return 'Mid';
  }
  
  if (['adc', 'bot', 'bottom', 'carry', 'botlane', 'bot lane', 'adcarry', 'ad carry', 'botlaner', 'ad', 'marksman', 'bot laner', 'a', 'b', '4'].includes(normalizedRole)) {
    return 'ADC';
  }
  
  if (['support', 'sup', 'supp', 'soutien', 'supporter', 'support lane', 'sp', 's', '5'].includes(normalizedRole)) {
    return 'Support';
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
  const normalizedRole = normalizeRoleName(playerCsv.role || 'Mid');
  
  // Log the role normalization for debugging
  if (normalizedRole !== playerCsv.role) {
    console.log(`Normalized role for ${playerCsv.name}: ${playerCsv.role} -> ${normalizedRole}`);
  }
  
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
