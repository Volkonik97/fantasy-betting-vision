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
  match_count?: number;
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
  match_count?: number;
}

// For RawDatabasePlayer
export type RawDatabasePlayer = Partial<DatabasePlayer>;

/**
 * Adapter to convert database player format to application Player model
 */
export const adaptPlayerFromDatabase = (dbPlayer: any): Player => {
  // Extract match_count - ensuring it's correctly handled as a number
  let matchCount: number = 0;
  if (dbPlayer.match_count !== undefined && dbPlayer.match_count !== null) {
    // Try to parse as number regardless of source format (string or number)
    const matchCountValue = parseInt(String(dbPlayer.match_count));
    if (!isNaN(matchCountValue)) {
      matchCount = matchCountValue;
    }
    console.log(`Player ${dbPlayer.playername || dbPlayer.playerid}: match_count field:`, dbPlayer.match_count, 'converted to:', matchCount);
  }
  
  // Extract damage_share - prioritize the damage_share field from player_summary_view
  let damageShare: number = 0;
  if (dbPlayer.damage_share !== undefined && dbPlayer.damage_share !== null) {
    const damageShareValue = parseFloat(String(dbPlayer.damage_share));
    if (!isNaN(damageShareValue)) {
      damageShare = damageShareValue;
    }
    console.log(`Player ${dbPlayer.playername || dbPlayer.playerid}: damage_share field:`, dbPlayer.damage_share, 'converted to:', damageShare);
  } else if (dbPlayer.damageshare !== undefined && dbPlayer.damageshare !== null) {
    const damageShareValue = parseFloat(String(dbPlayer.damageshare));
    if (!isNaN(damageShareValue)) {
      damageShare = damageShareValue;
    }
    console.log(`Player ${dbPlayer.playername || dbPlayer.playerid}: damageshare field:`, dbPlayer.damageshare, 'converted to:', damageShare);
  }
  
  // Extract vspm (Vision Score Per Minute)
  let vspm: number = 0;
  if (dbPlayer.vspm !== undefined && dbPlayer.vspm !== null) {
    const vspmValue = parseFloat(String(dbPlayer.vspm));
    if (!isNaN(vspmValue)) {
      vspm = vspmValue;
    }
    console.log(`Player ${dbPlayer.playername || dbPlayer.playerid}: vspm field:`, dbPlayer.vspm, 'converted to:', vspm);
  }
  
  // Extract wcpm (Wards Cleared Per Minute)
  let wcpm: number = 0;
  if (dbPlayer.wcpm !== undefined && dbPlayer.wcpm !== null) {
    const wcpmValue = parseFloat(String(dbPlayer.wcpm));
    if (!isNaN(wcpmValue)) {
      wcpm = wcpmValue;
    }
    console.log(`Player ${dbPlayer.playername || dbPlayer.playerid}: wcpm field:`, dbPlayer.wcpm, 'converted to:', wcpm);
  }
  
  // Extract gold_share_percent from player_summary_view
  let goldSharePercent: number = 0;
  if (dbPlayer.gold_share_percent !== undefined && dbPlayer.gold_share_percent !== null) {
    const goldShareValue = parseFloat(String(dbPlayer.gold_share_percent));
    if (!isNaN(goldShareValue)) {
      goldSharePercent = goldShareValue;
    }
    console.log(`Player ${dbPlayer.playername || dbPlayer.playerid}: gold_share_percent field:`, dbPlayer.gold_share_percent, 'converted to:', goldSharePercent);
  }
  
  // Extract KDA
  let kda: number = 0;
  if (dbPlayer.kda !== undefined && dbPlayer.kda !== null) {
    const kdaValue = parseFloat(String(dbPlayer.kda));
    if (!isNaN(kdaValue)) {
      kda = kdaValue;
    }
    console.log(`Player ${dbPlayer.playername || dbPlayer.playerid}: kda field:`, dbPlayer.kda, 'converted to:', kda);
  }
  
  // Extract efficiency score (new field in player_summary_view)
  let efficiencyScore: number = 0;
  if (dbPlayer.efficiency_score !== undefined && dbPlayer.efficiency_score !== null) {
    const scoreValue = parseFloat(String(dbPlayer.efficiency_score));
    if (!isNaN(scoreValue)) {
      efficiencyScore = scoreValue;
    }
    console.log(`Player ${dbPlayer.playername || dbPlayer.playerid}: efficiency_score field:`, dbPlayer.efficiency_score, 'converted to:', efficiencyScore);
  }
  
  // Extract aggression score (new field in player_summary_view)
  let aggressionScore: number = 0;
  if (dbPlayer.aggression_score !== undefined && dbPlayer.aggression_score !== null) {
    const scoreValue = parseFloat(String(dbPlayer.aggression_score));
    if (!isNaN(scoreValue)) {
      aggressionScore = scoreValue;
    }
    console.log(`Player ${dbPlayer.playername || dbPlayer.playerid}: aggression_score field:`, dbPlayer.aggression_score, 'converted to:', aggressionScore);
  }
  
  // Extract early game score (new field in player_summary_view)
  let earlyGameScore: number = 0;
  if (dbPlayer.earlygame_score !== undefined && dbPlayer.earlygame_score !== null) {
    const scoreValue = parseFloat(String(dbPlayer.earlygame_score));
    if (!isNaN(scoreValue)) {
      earlyGameScore = scoreValue;
    }
    console.log(`Player ${dbPlayer.playername || dbPlayer.playerid}: earlygame_score field:`, dbPlayer.earlygame_score, 'converted to:', earlyGameScore);
  }
  
  // Extract kill participation (new field in player_summary_view)
  let killParticipation: number = 0;
  if (dbPlayer.kill_participation_pct !== undefined && dbPlayer.kill_participation_pct !== null) {
    const participationValue = parseFloat(String(dbPlayer.kill_participation_pct));
    if (!isNaN(participationValue)) {
      killParticipation = participationValue;
    }
    console.log(`Player ${dbPlayer.playername || dbPlayer.playerid}: kill_participation_pct field:`, dbPlayer.kill_participation_pct, 'converted to:', killParticipation);
  }
  
  // Extract dmg_per_gold (new field in player_summary_view)
  let dmgPerGold: number = 0;
  if (dbPlayer.dmg_per_gold !== undefined && dbPlayer.dmg_per_gold !== null) {
    const dmgPerGoldValue = parseFloat(String(dbPlayer.dmg_per_gold));
    if (!isNaN(dmgPerGoldValue)) {
      dmgPerGold = dmgPerGoldValue;
    }
    console.log(`Player ${dbPlayer.playername || dbPlayer.playerid}: dmg_per_gold field:`, dbPlayer.dmg_per_gold, 'converted to:', dmgPerGold);
  }
  
  // Log final values for debugging
  console.log(`Final stats for ${dbPlayer.playername || dbPlayer.playerid}:`, { 
    vspm, 
    wcpm, 
    goldSharePercent,
    matchCount,
    kda,
    efficiencyScore,
    aggressionScore,
    earlyGameScore,
    killParticipation,
    dmgPerGold,
    gpm
  });
  
  return {
    id: dbPlayer.playerid || '',
    name: dbPlayer.playername || '',
    role: dbPlayer.position || '',
    image: dbPlayer.image || null,
    team: dbPlayer.teamid || '',
    
    // Performance stats
    kda: kda,
    avg_kills: parseFloat(String(dbPlayer.avg_kills || 0)),
    avg_deaths: parseFloat(String(dbPlayer.avg_deaths || 0)),
    avg_assists: parseFloat(String(dbPlayer.avg_assists || 0)),
    
    // Champion info
    championPool: dbPlayer.champion_pool ? String(dbPlayer.champion_pool) : '0',
    
    // Farm and gold
    csPerMin: parseFloat(String(dbPlayer.cspm || 0)),
    cspm: parseFloat(String(dbPlayer.cspm || 0)),
    earned_gpm: parseFloat(String(dbPlayer.earned_gpm || dbPlayer.gpm || 0)),
    earned_gold_share: parseFloat(String(dbPlayer.earned_gold_share || 0)),
    gold_share_percent: goldSharePercent,
    gpm: gpm,
    
    // Damage
    dpm: parseFloat(String(dbPlayer.dpm || 0)),
    damageShare: damageShare,
    dmg_per_gold: dmgPerGold,
    
    // Vision
    vspm: vspm,
    wcpm: wcpm,
    
    // Match statistics
    match_count: matchCount,
    
    // Early game
    avg_golddiffat15: parseFloat(String(dbPlayer.avg_golddiffat15 || dbPlayer.avg_golddiffat10 || 0)),
    avg_xpdiffat15: parseFloat(String(dbPlayer.avg_xpdiffat15 || dbPlayer.avg_xpdiffat10 || 0)),
    avg_csdiffat15: parseFloat(String(dbPlayer.avg_csdiffat15 || dbPlayer.avg_csdiffat10 || 0)),
    
    // First blood stats
    avg_firstblood_kill: parseFloat(String(dbPlayer.avg_firstblood_kill || 0)),
    avg_firstblood_assist: parseFloat(String(dbPlayer.avg_firstblood_assist || 0)),
    avg_firstblood_victim: parseFloat(String(dbPlayer.avg_firstblood_victim || 0)),
    
    // Additional metrics from player_summary_view
    kill_participation_pct: killParticipation,
    efficiency_score: efficiencyScore,
    aggression_score: aggressionScore,
    earlygame_score: earlyGameScore
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
    earned_gpm: player.earned_gpm || player.gpm || 0,
    earned_gold_share: player.earned_gold_share || player.gold_share_percent || 0,
    vspm: player.vspm || 0,
    wcpm: player.wcpm || 0,
    control_wards_bought: 0, // Not mapping this from Player model for now
    avg_golddiffat15: player.avg_golddiffat15 || 0,
    avg_xpdiffat15: player.avg_xpdiffat15 || 0,
    avg_csdiffat15: player.avg_csdiffat15 || 0,
    avg_firstblood_kill: player.avg_firstblood_kill || 0,
    avg_firstblood_assist: player.avg_firstblood_assist || 0,
    avg_firstblood_victim: player.avg_firstblood_victim || 0,
    match_count: player.match_count || 0
  };
};
