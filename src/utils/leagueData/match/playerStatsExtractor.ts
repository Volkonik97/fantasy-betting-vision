
import { PlayerMatchStats } from '../types';
import { LeagueGameDataRow } from '../../csvTypes';
import { parseBoolean, safeParseFloat, safeParseInt } from '../types';

/**
 * Extract player statistics from game rows
 */
export function extractPlayerStats(
  gameId: string,
  gameRows: LeagueGameDataRow[]
): Map<string, PlayerMatchStats> {
  const playerStatsMap = new Map<string, PlayerMatchStats>();
  
  gameRows.forEach(row => {
    // Skip if no player data or already processed
    if (!row.playerid || !row.teamid || playerStatsMap.has(row.playerid)) return;
    
    // Handle first blood participation for player stats
    const firstBloodKill = parseBoolean(row.firstbloodkill);
    const firstBloodAssist = parseBoolean(row.firstbloodassist);
    const firstBloodVictim = parseBoolean(row.firstbloodvictim);
    
    // Create a new player match stats entry
    playerStatsMap.set(row.playerid, {
      participant_id: row.participantid || `${row.playerid}_${gameId}`,
      player_id: row.playerid,
      team_id: row.teamid,
      match_id: gameId,
      side: row.side || '',
      position: row.position || '',
      champion: row.champion || '',
      
      // Set is_winner based on the result column
      is_winner: row.result === '1',
      
      // Combat stats - correctly handle first blood stats
      kills: safeParseInt(row.kills),
      deaths: safeParseInt(row.deaths),
      assists: safeParseInt(row.assists),
      double_kills: safeParseInt(row.doublekills),
      triple_kills: safeParseInt(row.triplekills),
      quadra_kills: safeParseInt(row.quadrakills),
      penta_kills: safeParseInt(row.pentakills),
      first_blood_kill: firstBloodKill,
      first_blood_assist: firstBloodAssist,
      first_blood_victim: firstBloodVictim,
      
      // Damage stats
      damage_to_champions: safeParseInt(row.damagetochampions),
      dpm: safeParseFloat(row.dpm),
      damage_share: safeParseFloat(row.damageshare),
      damage_taken_per_minute: safeParseFloat(row.damagetakenperminute),
      damage_mitigated_per_minute: safeParseFloat(row.damagemitigatedperminute),
      
      // Vision stats
      wards_placed: safeParseInt(row.wardsplaced),
      wpm: safeParseFloat(row.wpm),
      wards_killed: safeParseInt(row.wardskilled),
      wcpm: safeParseFloat(row.wcpm),
      control_wards_bought: safeParseInt(row.controlwardsbought),
      vision_score: safeParseInt(row.visionscore),
      vspm: safeParseFloat(row.vspm),
      
      // Gold stats
      total_gold: safeParseInt(row.totalgold),
      earned_gold: safeParseInt(row.earnedgold),
      earned_gpm: safeParseFloat(row['earned gpm']),
      earned_gold_share: safeParseFloat(row.earnedgoldshare),
      gold_spent: safeParseInt(row.goldspent),
      gspd: safeParseFloat(row.gspd),
      gpr: safeParseFloat(row.gpr),
      
      // CS stats
      total_cs: safeParseInt(row['total cs']),
      minion_kills: safeParseInt(row.minionkills),
      monster_kills: safeParseInt(row.monsterkills),
      monster_kills_own_jungle: safeParseInt(row.monsterkillsownjungle),
      monster_kills_enemy_jungle: safeParseInt(row.monsterkillsenemyjungle),
      cspm: safeParseFloat(row.cspm),
      
      // Timeline stats
      gold_at_10: safeParseInt(row.goldat10),
      xp_at_10: safeParseInt(row.xpat10),
      cs_at_10: safeParseInt(row.csat10),
      opp_gold_at_10: safeParseInt(row.opp_goldat10),
      opp_xp_at_10: safeParseInt(row.opp_xpat10),
      opp_cs_at_10: safeParseInt(row.opp_csat10),
      gold_diff_at_10: safeParseInt(row.golddiffat10),
      xp_diff_at_10: safeParseInt(row.xpdiffat10),
      cs_diff_at_10: safeParseInt(row.csdiffat10),
      kills_at_10: safeParseInt(row.killsat10),
      assists_at_10: safeParseInt(row.assistsat10),
      deaths_at_10: safeParseInt(row.deathsat10),
      opp_kills_at_10: safeParseInt(row.opp_killsat10),
      opp_assists_at_10: safeParseInt(row.opp_assistsat10),
      opp_deaths_at_10: safeParseInt(row.opp_deathsat10),
      
      // Timeline stats: 15 min
      gold_at_15: safeParseInt(row.goldat15),
      xp_at_15: safeParseInt(row.xpat15),
      cs_at_15: safeParseInt(row.csat15),
      opp_gold_at_15: safeParseInt(row.opp_goldat15),
      opp_xp_at_15: safeParseInt(row.opp_xpat15),
      opp_cs_at_15: safeParseInt(row.opp_csat15),
      gold_diff_at_15: safeParseInt(row.golddiffat15),
      xp_diff_at_15: safeParseInt(row.xpdiffat15),
      cs_diff_at_15: safeParseInt(row.csdiffat15),
      kills_at_15: safeParseInt(row.killsat15),
      assists_at_15: safeParseInt(row.assistsat15),
      deaths_at_15: safeParseInt(row.deathsat15),
      opp_kills_at_15: safeParseInt(row.opp_killsat15),
      opp_assists_at_15: safeParseInt(row.opp_assistsat15),
      opp_deaths_at_15: safeParseInt(row.opp_deathsat15),
      
      // Timeline stats: 20 min
      gold_at_20: safeParseInt(row.goldat20),
      xp_at_20: safeParseInt(row.xpat20),
      cs_at_20: safeParseInt(row.csat20),
      opp_gold_at_20: safeParseInt(row.opp_goldat20),
      opp_xp_at_20: safeParseInt(row.opp_xpat20),
      opp_cs_at_20: safeParseInt(row.opp_csat20),
      gold_diff_at_20: safeParseInt(row.golddiffat20),
      xp_diff_at_20: safeParseInt(row.xpdiffat20),
      cs_diff_at_20: safeParseInt(row.csdiffat20),
      kills_at_20: safeParseInt(row.killsat20),
      assists_at_20: safeParseInt(row.assistsat20),
      deaths_at_20: safeParseInt(row.deathsat20),
      opp_kills_at_20: safeParseInt(row.opp_killsat20),
      opp_assists_at_20: safeParseInt(row.opp_assistsat20),
      opp_deaths_at_20: safeParseInt(row.opp_deathsat20),
      
      // Timeline stats: 25 min
      gold_at_25: safeParseInt(row.goldat25),
      xp_at_25: safeParseInt(row.xpat25),
      cs_at_25: safeParseInt(row.csat25),
      opp_gold_at_25: safeParseInt(row.opp_goldat25),
      opp_xp_at_25: safeParseInt(row.opp_xpat25),
      opp_cs_at_25: safeParseInt(row.opp_csat25),
      gold_diff_at_25: safeParseInt(row.golddiffat25),
      xp_diff_at_25: safeParseInt(row.xpdiffat25),
      cs_diff_at_25: safeParseInt(row.csdiffat25),
      kills_at_25: safeParseInt(row.killsat25),
      assists_at_25: safeParseInt(row.assistsat25),
      deaths_at_25: safeParseInt(row.deathsat25),
      opp_kills_at_25: safeParseInt(row.opp_killsat25),
      opp_assists_at_25: safeParseInt(row.opp_assistsat25),
      opp_deaths_at_25: safeParseInt(row.opp_deathsat25) || 0
    });
  });
  
  return playerStatsMap;
}
