import { Player } from "@/utils/models/types";

/**
 * Type definition for player data as stored in the database
 */
export interface DatabasePlayer {
  playerid: string;
  playername: string;
  position?: string;
  image?: string | null;
  teamid?: string;
  avg_kills: number;
  avg_deaths: number;
  avg_assists: number;
  kda: number;
  champion_pool: number;
  cspm: number;
  dpm: number;
  damage_share: number;
  totalgold: number;
  total_cs: number;
  earned_gpm: number;
  earned_gold_share: number;
  vspm: number;
  wcpm: number;
  control_wards_bought: number;
  // Additional fields...
}

/**
 * Adapter to convert database player format to application Player model
 */
export const adaptPlayerFromDatabase = (dbPlayer: any): Player => {
  return {
    id: dbPlayer.playerid || '',
    name: dbPlayer.playername || '',
    role: dbPlayer.position || '',
    image: dbPlayer.image || null,
    team_id: dbPlayer.teamid || '',
    
    // Performance stats
    kda: dbPlayer.kda || 0,
    avg_kills: dbPlayer.avg_kills || 0,
    avg_deaths: dbPlayer.avg_deaths || 0,
    avg_assists: dbPlayer.avg_assists || 0,
    
    // Champion info
    champion_pool: dbPlayer.champion_pool ? String(dbPlayer.champion_pool) : '0',
    
    // Farm and gold
    cspm: dbPlayer.cspm || 0,
    earned_gpm: dbPlayer.earned_gpm || 0,
    earned_gold_share: dbPlayer.earned_gold_share || 0,
    
    // Damage
    dpm: dbPlayer.dpm || 0,
    damage_share: dbPlayer.damage_share || 0,
    
    // Vision
    vspm: dbPlayer.vspm || 0,
    wcpm: dbPlayer.wcpm || 0,
    
    // Early game
    avg_golddiffat15: dbPlayer.avg_golddiffat15 || 0,
    avg_xpdiffat15: dbPlayer.avg_xpdiffat15 || 0,
    avg_csdiffat15: dbPlayer.avg_csdiffat15 || 0,
    
    // Other stats
    avg_firstblood_kill: dbPlayer.avg_firstblood_kill || 0,
    avg_firstblood_assist: dbPlayer.avg_firstblood_assist || 0,
    avg_firstblood_victim: dbPlayer.avg_firstblood_victim || 0
  };
};

/**
 * Adapter to convert application Player model to database format
 */
export const adaptPlayerForDatabase = (player: Player): DatabasePlayer => {
  return {
    playerid: player.id,
    playername: player.name,
    position: player.role,
    image: player.image,
    teamid: player.team_id,
    avg_kills: player.avg_kills || 0,
    avg_deaths: player.avg_deaths || 0,
    avg_assists: player.avg_assists || 0,
    kda: player.kda || 0,
    champion_pool: player.champion_pool ? parseInt(player.champion_pool as string, 10) : 0,
    cspm: player.cspm || 0,
    dpm: player.dpm || 0,
    damage_share: player.damage_share || 0,
    totalgold: 0, // Not mapping this from Player model for now
    total_cs: 0, // Not mapping this from Player model for now
    earned_gpm: player.earned_gpm || 0,
    earned_gold_share: player.earned_gold_share || 0,
    vspm: player.vspm || 0,
    wcpm: player.wcpm || 0,
    control_wards_bought: 0 // Not mapping this from Player model for now
  };
};
