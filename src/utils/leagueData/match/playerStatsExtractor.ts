
import { PlayerMatchStats } from '../../models/types';

export const extractPlayerStats = (data: any): PlayerMatchStats => {
  const stats: PlayerMatchStats = {
    participant_id: data.participantId || `${data.playerId}_${data.matchId}`,
    player_id: data.playerId,
    team_id: data.teamId,
    match_id: data.matchId,
    side: data.side || 'Unknown',
    position: data.position || 'Unknown',
    champion: data.champion || 'Unknown',
    is_winner: !!data.isWinner,
    
    // Combat stats
    kills: data.kills || 0,
    deaths: data.deaths || 0,
    assists: data.assists || 0,
    
    // Basic stats from original data
    damage_to_champions: data.damageToChampions || 0,
    dpm: data.dpm || 0,
    cspm: data.cspm || 0,
    total_cs: data.totalCs || 0,
  };
  
  // Add optional stats if present
  if (data.doubleKills !== undefined) stats.double_kills = data.doubleKills;
  if (data.tripleKills !== undefined) stats.triple_kills = data.tripleKills;
  if (data.quadraKills !== undefined) stats.quadra_kills = data.quadraKills;
  if (data.pentaKills !== undefined) stats.penta_kills = data.pentaKills;
  
  // Add first blood stats
  if (data.firstBloodKill !== undefined) stats.first_blood_kill = !!data.firstBloodKill;
  if (data.firstBloodAssist !== undefined) stats.first_blood_assist = !!data.firstBloodAssist;
  if (data.firstBloodVictim !== undefined) stats.first_blood_victim = !!data.firstBloodVictim;
  
  // Add damage stats
  if (data.damageShare !== undefined) stats.damage_share = data.damageShare;
  if (data.damageTakenPerMinute !== undefined) stats.damage_taken_per_minute = data.damageTakenPerMinute;
  if (data.damageMitigatedPerMinute !== undefined) stats.damage_mitigated_per_minute = data.damageMitigatedPerMinute;
  
  // Add vision stats
  if (data.wardsPlaced !== undefined) stats.wards_placed = data.wardsPlaced;
  if (data.wpm !== undefined) stats.wpm = data.wpm;
  if (data.wardsKilled !== undefined) stats.wards_killed = data.wardsKilled;
  if (data.wcpm !== undefined) stats.wcpm = data.wcpm;
  if (data.controlWardsBought !== undefined) stats.control_wards_bought = data.controlWardsBought;
  if (data.visionScore !== undefined) stats.vision_score = data.visionScore;
  if (data.vspm !== undefined) stats.vspm = data.vspm;
  
  // Add gold stats
  if (data.totalGold !== undefined) stats.total_gold = data.totalGold;
  if (data.earnedGold !== undefined) stats.earned_gold = data.earnedGold;
  if (data.earnedGpm !== undefined) stats.earned_gpm = data.earnedGpm;
  if (data.earnedGoldShare !== undefined) stats.earned_gold_share = data.earnedGoldShare;
  if (data.goldSpent !== undefined) stats.gold_spent = data.goldSpent;
  if (data.gspd !== undefined) stats.gspd = data.gspd;
  if (data.gpr !== undefined) stats.gpr = data.gpr;
  
  // Add CS stats beyond the basic ones
  if (data.minionKills !== undefined) stats.minion_kills = data.minionKills;
  if (data.monsterKills !== undefined) stats.monster_kills = data.monsterKills;
  if (data.monsterKillsOwnJungle !== undefined) stats.monster_kills_own_jungle = data.monsterKillsOwnJungle;
  if (data.monsterKillsEnemyJungle !== undefined) stats.monster_kills_enemy_jungle = data.monsterKillsEnemyJungle;
  
  // Add timeline stats for the 10, 15, 20, and 25 minute marks
  // 10-minute mark
  if (data.goldAt10 !== undefined) stats.gold_at_10 = data.goldAt10;
  if (data.xpAt10 !== undefined) stats.xp_at_10 = data.xpAt10;
  if (data.csAt10 !== undefined) stats.cs_at_10 = data.csAt10;
  if (data.oppGoldAt10 !== undefined) stats.opp_gold_at_10 = data.oppGoldAt10;
  if (data.oppXpAt10 !== undefined) stats.opp_xp_at_10 = data.oppXpAt10;
  if (data.oppCsAt10 !== undefined) stats.opp_cs_at_10 = data.oppCsAt10;
  if (data.goldDiffAt10 !== undefined) stats.gold_diff_at_10 = data.goldDiffAt10;
  if (data.xpDiffAt10 !== undefined) stats.xp_diff_at_10 = data.xpDiffAt10;
  if (data.csDiffAt10 !== undefined) stats.cs_diff_at_10 = data.csDiffAt10;
  if (data.killsAt10 !== undefined) stats.kills_at_10 = data.killsAt10;
  if (data.assistsAt10 !== undefined) stats.assists_at_10 = data.assistsAt10;
  if (data.deathsAt10 !== undefined) stats.deaths_at_10 = data.deathsAt10;
  if (data.oppKillsAt10 !== undefined) stats.opp_kills_at_10 = data.oppKillsAt10;
  if (data.oppAssistsAt10 !== undefined) stats.opp_assists_at_10 = data.oppAssistsAt10;
  if (data.oppDeathsAt10 !== undefined) stats.opp_deaths_at_10 = data.oppDeathsAt10;
  
  // 15-minute mark
  if (data.goldAt15 !== undefined) stats.gold_at_10 = data.goldAt15;
  if (data.xpAt15 !== undefined) stats.xp_at_10 = data.xpAt15;
  if (data.csAt15 !== undefined) stats.cs_at_10 = data.csAt15;
  if (data.oppGoldAt15 !== undefined) stats.opp_gold_at_10 = data.oppGoldAt15;
  if (data.oppXpAt15 !== undefined) stats.opp_xp_at_10 = data.oppXpAt15;
  if (data.oppCsAt15 !== undefined) stats.opp_cs_at_10 = data.oppCsAt15;
  if (data.goldDiffAt15 !== undefined) stats.gold_diff_at_10 = data.goldDiffAt15;
  if (data.xpDiffAt15 !== undefined) stats.xp_diff_at_10 = data.xpDiffAt15;
  if (data.csDiffAt15 !== undefined) stats.cs_diff_at_10 = data.csDiffAt15;
  if (data.killsAt15 !== undefined) stats.kills_at_10 = data.killsAt15;
  if (data.assistsAt15 !== undefined) stats.assists_at_10 = data.assistsAt15;
  if (data.deathsAt15 !== undefined) stats.deaths_at_10 = data.deathsAt15;
  if (data.oppKillsAt15 !== undefined) stats.opp_kills_at_10 = data.oppKillsAt15;
  if (data.oppAssistsAt15 !== undefined) stats.opp_assists_at_10 = data.oppAssistsAt15;
  if (data.oppDeathsAt15 !== undefined) stats.opp_deaths_at_10 = data.oppDeathsAt15;
  
  // Add similar mappings for 20 and 25 minute marks as needed
  
  return stats;
};
