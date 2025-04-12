
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
  avg_golddiffat15?: number;
  avg_xpdiffat15?: number;
  avg_csdiffat15?: number;
  avg_firstblood_kill?: number;
  avg_firstblood_assist?: number;
  avg_firstblood_victim?: number;
}

// For RawDatabasePlayer
export type RawDatabasePlayer = Partial<DatabasePlayer>;

/**
 * Adapter to convert database player format to application Player model
 */
export const adaptPlayerFromDatabase = (dbPlayer: any): Player => {
  // Safely handle and log damage share for debugging
  let damageShare = 0;
  
  if (dbPlayer.damage_share !== undefined) {
    // Handle player_summary_view format (might be directly there)
    damageShare = dbPlayer.damage_share;
  } else if (dbPlayer.damageshare !== undefined) {
    // Handle alternate field name that might be used
    damageShare = dbPlayer.damageshare;
  }
  
  console.log(`Adapting player ${dbPlayer.playername || dbPlayer.playerid} with damage_share:`, 
    dbPlayer.damage_share, 
    typeof dbPlayer.damage_share, 
    `Final damageShare value:`, damageShare);
  
  return {
    id: dbPlayer.playerid || '',
    name: dbPlayer.playername || '',
    role: dbPlayer.position || '',
    image: dbPlayer.image || null,
    team: dbPlayer.teamid || '',
    
    // Performance stats
    kda: dbPlayer.kda || 0,
    avg_kills: dbPlayer.avg_kills || 0,
    avg_deaths: dbPlayer.avg_deaths || 0,
    avg_assists: dbPlayer.avg_assists || 0,
    
    // Champion info
    championPool: dbPlayer.champion_pool ? String(dbPlayer.champion_pool) : '0',
    
    // Farm and gold
    csPerMin: dbPlayer.cspm || 0,
    cspm: dbPlayer.cspm || 0,
    earned_gpm: dbPlayer.earned_gpm || 0,
    earned_gold_share: dbPlayer.earned_gold_share || 0,
    
    // Damage
    dpm: dbPlayer.dpm || 0,
    damageShare: damageShare,
    
    // Vision
    vspm: dbPlayer.vspm || 0,
    wcpm: dbPlayer.wcpm || 0,
    
    // Early game
    avg_golddiffat15: dbPlayer.avg_golddiffat15 || 0,
    avg_xpdiffat15: dbPlayer.avg_xpdiffat15 || 0,
    avg_csdiffat15: dbPlayer.avg_csdiffat15 || 0,
    
    // First blood stats
    avg_firstblood_kill: dbPlayer.avg_firstblood_kill || 0,
    avg_firstblood_assist: dbPlayer.avg_firstblood_assist || 0,
    avg_firstblood_victim: dbPlayer.avg_firstblood_victim || 0
  };
};

/**
 * Adapter to convert application Player model to database format
 */
export const adaptPlayerForDatabase = (player: Player): RawDatabasePlayer => {
  return {
    playerid: player.id,
    playername: player.name,
    position: player.role,
    image: player.image,
    teamid: player.team,
    avg_kills: player.avg_kills || 0,
    avg_deaths: player.avg_deaths || 0,
    avg_assists: player.avg_assists || 0,
    kda: player.kda || 0,
    champion_pool: typeof player.championPool === 'string' ? parseInt(player.championPool, 10) : (Array.isArray(player.championPool) ? player.championPool.length : 0),
    cspm: player.cspm || player.csPerMin || 0,
    dpm: player.dpm || 0,
    damage_share: player.damageShare || 0,
    totalgold: 0, // Not mapping this from Player model for now
    total_cs: 0, // Not mapping this from Player model for now
    earned_gpm: player.earned_gpm || 0,
    earned_gold_share: player.earned_gold_share || 0,
    vspm: player.vspm || 0,
    wcpm: player.wcpm || 0,
    control_wards_bought: 0, // Not mapping this from Player model for now
    avg_golddiffat15: player.avg_golddiffat15 || 0,
    avg_xpdiffat15: player.avg_xpdiffat15 || 0,
    avg_csdiffat15: player.avg_csdiffat15 || 0,
    avg_firstblood_kill: player.avg_firstblood_kill || 0,
    avg_firstblood_assist: player.avg_firstblood_assist || 0,
    avg_firstblood_victim: player.avg_firstblood_victim || 0
  };
};
