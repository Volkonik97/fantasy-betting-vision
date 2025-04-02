
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
  
  const normalizedRole = role.toLowerCase().trim();
  
  if (normalizedRole === 'top' || normalizedRole === 'toplane') return 'Top';
  if (['jungle', 'jng', 'jgl', 'jg'].includes(normalizedRole)) return 'Jungle';
  if (['mid', 'middle', 'midlane'].includes(normalizedRole)) return 'Mid';
  if (['adc', 'bot', 'bottom', 'carry', 'botlane', 'adcarry'].includes(normalizedRole)) return 'ADC';
  if (['support', 'sup', 'supp', 'soutien'].includes(normalizedRole)) return 'Support';
  
  // Log unknown roles for debugging
  console.log(`Unknown role encountered: "${role}", defaulting to Mid`);
  
  // Default to Mid if role is unknown
  return 'Mid';
}

/**
 * Helper function to convert player CSV to player object
 */
export function playerToPlayerObject(playerCsv: any): Player {
  // Normalize the role
  const normalizedRole = normalizeRoleName(playerCsv.role || 'Mid');
  
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
