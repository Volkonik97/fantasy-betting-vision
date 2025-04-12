
/**
 * Adapter module to handle database schema and model mismatches for player data.
 */

import { Player, PlayerRole } from "@/utils/models/types";

/**
 * Interface for the raw player data from the database
 */
export interface RawDatabasePlayer {
  id?: string;
  playerid?: string;
  name?: string;
  playername?: string;
  role?: string;
  position?: string;
  image?: string;
  teamid?: string;
  team_id?: string;
  avg_kills?: number;
  avg_deaths?: number;
  avg_assists?: number;
  kda?: number;
  champion_pool?: number;
  cspm?: number;
  cs_per_min?: number; 
  dpm?: number;
  damage_share?: number;
  [key: string]: any; // Allow any other properties from the database
}

/**
 * Normalize a player role to a valid PlayerRole
 */
const normalizeRole = (role?: string): PlayerRole => {
  if (!role) return 'Unknown';
  
  const normalizedRole = role.toLowerCase();
  if (normalizedRole.includes('top')) return 'Top';
  if (normalizedRole.includes('jungle') || normalizedRole.includes('jng')) return 'Jungle';
  if (normalizedRole.includes('mid')) return 'Mid';
  if (normalizedRole.includes('bot') || normalizedRole.includes('adc')) return 'ADC';
  if (normalizedRole.includes('sup')) return 'Support';
  
  return 'Unknown';
};

/**
 * Convert a raw database player object to our application Player model
 */
export const adaptPlayerFromDatabase = (data: RawDatabasePlayer): Player => {
  const championPool = typeof data.champion_pool === 'number' 
    ? [`${data.champion_pool} champions`] 
    : [];
  
  return {
    id: data.id || data.playerid || '',
    name: data.name || data.playername || 'Unknown Player',
    role: normalizeRole(data.role || data.position),
    image: data.image || '',
    team: data.teamid || data.team_id || '',
    kda: data.kda || 0,
    csPerMin: data.cspm || data.cs_per_min || 0,
    damageShare: data.damage_share || 0,
    championPool: championPool
  };
};

/**
 * Convert an application Player model to a format suitable for database insertion
 */
export const adaptPlayerForDatabase = (player: Player): RawDatabasePlayer => {
  // Convert championPool array to number if needed
  let championPoolCount: number | undefined = undefined;
  if (Array.isArray(player.championPool) && player.championPool.length > 0) {
    // If it's a string like "5 champions", extract the number
    const firstItem = player.championPool[0];
    if (typeof firstItem === 'string' && firstItem.includes('champions')) {
      const match = firstItem.match(/(\d+)/);
      if (match && match[1]) {
        championPoolCount = parseInt(match[1], 10);
      }
    } else {
      championPoolCount = player.championPool.length;
    }
  } else if (typeof player.championPool === 'string') {
    championPoolCount = 1; // At least one champion
  }
  
  return {
    playerid: player.id,
    playername: player.name,
    position: player.role.toLowerCase(),
    image: player.image,
    team_id: player.team,
    kda: player.kda,
    cspm: player.csPerMin,
    damage_share: player.damageShare,
    champion_pool: championPoolCount
  };
};
