import { Player, PlayerRole } from '@/utils/models/types';

/**
 * Interface representing the raw player data structure from the database
 */
export interface RawDatabasePlayer {
  playerid?: string;
  playername?: string;
  position?: string;
  image?: string;
  teamid?: string;
  // Stats fields
  avg_kills?: number;
  avg_deaths?: number;
  avg_assists?: number;
  kda?: number;
  champion_pool?: number;
  cspm?: number;
  dpm?: number;
  damage_share?: number;
  // Other fields that might be in the database
  [key: string]: any;
}

/**
 * Adapt a raw database player to our application Player model
 */
export const adaptPlayerFromDatabase = (data: RawDatabasePlayer): Player => {
  return {
    id: data.playerid || '',
    name: data.playername || '',
    role: (data.position as PlayerRole) || 'Unknown',
    image: data.image || '',
    team: data.teamid || '',
    kda: data.kda || 0,
    csPerMin: data.cspm || 0,
    damageShare: data.damage_share || 0,
    championPool: data.champion_pool || 0
  };
};

/**
 * Adapt an application Player model to a format suitable for database insertion
 */
export const adaptPlayerForDatabase = (player: Player): RawDatabasePlayer => {
  return {
    playerid: player.id,
    playername: player.name,
    position: player.role,
    image: player.image,
    teamid: player.team,
    kda: player.kda,
    cspm: player.csPerMin,
    damage_share: player.damageShare,
    champion_pool: typeof player.championPool === 'number' ? player.championPool : 0
  };
};
