
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
 * This version is completely rewritten for better reliability
 */
export function normalizeRoleName(role?: string): PlayerRole {
  // Default to Mid if role is undefined, null or empty
  if (!role) {
    console.log("No role provided, defaulting to Mid");
    return 'Mid';
  }
  
  // Convert to string and normalize for comparison
  const normalizedRole = String(role).toLowerCase().trim();
  
  // Define role mapping with exhaustive variations
  const roleMap: Record<string, PlayerRole> = {
    // Top lane variations
    'top': 'Top',
    'toplane': 'Top',
    'top lane': 'Top',
    'toplaner': 'Top',
    'top laner': 'Top',
    'toplar': 'Top',
    't': 'Top',
    'ㅆ': 'Top',
    'tpplanee': 'Top',
    'tplaner': 'Top',
    'topl': 'Top',
    'toplne': 'Top',
    'toplaine': 'Top',
    'top-laner': 'Top',
    'topln': 'Top',
    'tope': 'Top',
    'to': 'Top',
    'tp': 'Top',
    '1': 'Top',
    
    // Jungle variations
    'jungle': 'Jungle',
    'jng': 'Jungle',
    'jgl': 'Jungle',
    'jg': 'Jungle',
    'jungler': 'Jungle',
    'jgler': 'Jungle',
    'jung': 'Jungle',
    'j': 'Jungle',
    '2': 'Jungle',
    
    // Mid lane variations
    'mid': 'Mid',
    'middle': 'Mid',
    'midlane': 'Mid',
    'mid lane': 'Mid',
    'midlaner': 'Mid',
    'middle lane': 'Mid',
    'middler': 'Mid',
    'midlar': 'Mid',
    'm': 'Mid',
    '3': 'Mid',
    
    // ADC/Bot lane variations
    'adc': 'ADC',
    'bot': 'ADC',
    'bottom': 'ADC',
    'carry': 'ADC',
    'botlane': 'ADC',
    'bot lane': 'ADC',
    'adcarry': 'ADC',
    'ad carry': 'ADC',
    'botlaner': 'ADC',
    'ad': 'ADC',
    'marksman': 'ADC',
    'bot laner': 'ADC',
    'a': 'ADC',
    'b': 'ADC',
    '4': 'ADC',
    
    // Support variations
    'support': 'Support',
    'sup': 'Support',
    'supp': 'Support',
    'soutien': 'Support',
    'supporter': 'Support',
    'support lane': 'Support',
    'sp': 'Support',
    's': 'Support',
    '5': 'Support',

    // Unknown variations
    'unknown': 'Unknown',
    '?': 'Unknown',
    'inconnu': 'Unknown',
    'undefined': 'Unknown',
    'null': 'Unknown'
  };
  
  // Direct match for canonical roles
  if (role === 'Top' || role === 'Jungle' || role === 'Mid' || role === 'ADC' || role === 'Support' || role === 'Unknown') {
    return role as PlayerRole;
  }
  
  // Look up the role in our mapping
  const standardRole = roleMap[normalizedRole];
  
  if (standardRole) {
    return standardRole;
  }
  
  // Log unknown roles for debugging
  console.warn(`Unknown role encountered: "${role}" (normalized: "${normalizedRole}"), defaulting to Unknown`);
  
  // Default to Unknown if role is unrecognized (changed from Mid to Unknown)
  return 'Unknown';
}

/**
 * Helper function to convert player CSV to player object
 */
export function playerToPlayerObject(playerCsv: any): Player {
  // Normalize the role
  const normalizedRole = normalizeRoleName(playerCsv.role);
  
  // Handle killParticipation to ensure we have both killParticipation and kill_participation_pct
  const killParticipationValue = parseFloat(playerCsv.killParticipation || '0') || 0;
  
  return {
    id: playerCsv.id,
    name: playerCsv.name,
    role: normalizedRole,
    image: playerCsv.image,
    team: playerCsv.team,
    kda: parseFloat(playerCsv.kda) || 0,
    csPerMin: parseFloat(playerCsv.csPerMin) || 0,
    cspm: parseFloat(playerCsv.csPerMin) || 0, // Add cspm property
    damageShare: parseFloat(playerCsv.damageShare) || 0,
    killParticipation: killParticipationValue,
    kill_participation_pct: killParticipationValue, // Add kill_participation_pct property
    championPool: playerCsv.championPool ? 
      (Array.isArray(playerCsv.championPool) ? 
        playerCsv.championPool : 
        String(playerCsv.championPool).split(',').map((champ: string) => champ.trim())
      ) : []
  };
}

/**
 * Helper function to calculate KDA from tracker data
 */
function calculateKDA(kills: number, deaths: number, assists: number): number {
  return (kills + assists) / (deaths + 1);
}

/**
 * Helper function to calculate CS per minute from tracker data
 */
function calculateCSPerMin(cs: number, games: number): number {
  return cs / games;
}

/**
 * Helper function to create player object from tracker data
 */
export function createPlayerFromTrackerData(data: any): Player {
  const role = normalizeRoleName(data.role || 'Unknown');
  
  // Calculate stats from tracker data
  const kda = calculateKDA(data.kills, data.deaths, data.assists);
  const csPerMin = calculateCSPerMin(data.cs, data.games);
  const damageShare = data.damageShare || 0;
  const killParticipation = data.killParticipation || 0;
  
  return {
    id: data.id,
    name: data.name,
    role: role,
    image: data.image,
    team: data.team,
    kda: kda,
    csPerMin: csPerMin,
    cspm: csPerMin, // Add cspm property
    damageShare: damageShare,
    killParticipation: killParticipation,
    kill_participation_pct: killParticipation * 100, // Convert to percentage for consistency with API
    championPool: data.championPool
  };
}
