
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

// For player data in player_summary_view
export interface PlayerSummaryViewData {
  playerid: string;
  playername: string;
  position: string;
  teamid: string;
  avg_kills: number;
  avg_deaths: number;
  avg_assists: number;
  kda: number;
  cspm: number;
  dpm: number;
  damage_share: number;
  gpm?: number;
  gold_share_percent?: number;
  vspm: number;
  wcpm: number;
  dmg_per_gold?: number;
  kill_participation_pct?: number;
  earlygame_score?: number;
  aggression_score?: number;
  avg_golddiffat10?: number;
  avg_xpdiffat10?: number;
  avg_csdiffat10?: number;
  efficiency_score?: number;
}

// For RawDatabasePlayer
export type RawDatabasePlayer = Partial<DatabasePlayer>;

/**
 * Adapter to convert database player format to application Player model
 */
export const adaptPlayerFromDatabase = (dbPlayer: any): Player => {
  // Safely handle damage share - prioritize the damage_share field from player_summary_view
  let damageShare: number = 0;
  
  if (dbPlayer.damage_share !== undefined && dbPlayer.damage_share !== null) {
    // Handle player_summary_view format (damage_share field)
    const damageShareValue = parseFloat(dbPlayer.damage_share);
    if (!isNaN(damageShareValue)) {
      damageShare = damageShareValue;
    }
    console.log(`Player ${dbPlayer.playername || dbPlayer.playerid}: damage_share field:`, dbPlayer.damage_share, 'converted to:', damageShare);
  } else if (dbPlayer.damageshare !== undefined && dbPlayer.damageshare !== null) {
    // Handle alternate field name that might be used
    const damageShareValue = parseFloat(dbPlayer.damageshare);
    if (!isNaN(damageShareValue)) {
      damageShare = damageShareValue;
    }
    console.log(`Player ${dbPlayer.playername || dbPlayer.playerid}: damageshare field:`, dbPlayer.damageshare, 'converted to:', damageShare);
  }
  
  // Log the final damageShare value for debugging
  console.log(`Final damageShare value for ${dbPlayer.playername || dbPlayer.playerid}:`, damageShare, typeof damageShare);
  
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
  // Ensure damageShare is properly formatted for database storage
  let damageShare = 0;
  if (player.damageShare !== undefined && player.damageShare !== null) {
    if (typeof player.damageShare === 'string') {
      const parsed = parseFloat(player.damageShare);
      if (!isNaN(parsed)) {
        damageShare = parsed;
      }
    } else if (typeof player.damageShare === 'number' && !isNaN(player.damageShare)) {
      damageShare = player.damageShare;
    }
  }

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
    damage_share: damageShare,
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
