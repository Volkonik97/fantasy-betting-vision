
/**
 * Player match statistics interface
 */
export interface PlayerMatchStats {
  participant_id: string;
  player_id: string;
  team_id: string;
  match_id: string;
  side: string;
  position: string;
  champion: string;
  is_winner: boolean;
  
  // Combat stats
  kills: number;
  deaths: number;
  assists: number;
  double_kills?: number;
  triple_kills?: number;
  quadra_kills?: number;
  penta_kills?: number;
  first_blood_kill?: boolean;
  first_blood_assist?: boolean;
  first_blood_victim?: boolean;
  
  // Damage stats
  damage_to_champions?: number;
  dpm?: number;
  damage_share?: number;
  damage_taken_per_minute?: number;
  damage_mitigated_per_minute?: number;
  
  // Vision stats
  wards_placed?: number;
  wpm?: number;
  wards_killed?: number;
  wcpm?: number;
  control_wards_bought?: number;
  vision_score?: number;
  vspm?: number;
  
  // Gold stats
  total_gold?: number;
  earned_gold?: number;
  earned_gpm?: number;
  earned_gold_share?: number;
  gold_spent?: number;
  gspd?: number;
  gpr?: number;
  
  // CS stats
  total_cs?: number;
  minion_kills?: number;
  monster_kills?: number;
  monster_kills_own_jungle?: number;
  monster_kills_enemy_jungle?: number;
  cspm?: number;
  
  // Timeline stats: 10 min
  gold_at_10?: number;
  xp_at_10?: number;
  cs_at_10?: number;
  opp_gold_at_10?: number;
  opp_xp_at_10?: number;
  opp_cs_at_10?: number;
  gold_diff_at_10?: number;
  xp_diff_at_10?: number;
  cs_diff_at_10?: number;
  kills_at_10?: number;
  assists_at_10?: number;
  deaths_at_10?: number;
  opp_kills_at_10?: number;
  opp_assists_at_10?: number;
  opp_deaths_at_10?: number;
  
  // Timeline stats: 15 min
  gold_at_15?: number;
  xp_at_15?: number;
  cs_at_15?: number;
  opp_gold_at_15?: number;
  opp_xp_at_15?: number;
  opp_cs_at_15?: number;
  gold_diff_at_15?: number;
  xp_diff_at_15?: number;
  cs_diff_at_15?: number;
  kills_at_15?: number;
  assists_at_15?: number;
  deaths_at_15?: number;
  opp_kills_at_15?: number;
  opp_assists_at_15?: number;
  opp_deaths_at_15?: number;
  
  // Timeline stats: 20 min
  gold_at_20?: number;
  xp_at_20?: number;
  cs_at_20?: number;
  opp_gold_at_20?: number;
  opp_xp_at_20?: number;
  opp_cs_at_20?: number;
  gold_diff_at_20?: number;
  xp_diff_at_20?: number;
  cs_diff_at_20?: number;
  kills_at_20?: number;
  assists_at_20?: number;
  deaths_at_20?: number;
  opp_kills_at_20?: number;
  opp_assists_at_20?: number;
  opp_deaths_at_20?: number;
  
  // Timeline stats: 25 min
  gold_at_25?: number;
  xp_at_25?: number;
  cs_at_25?: number;
  opp_gold_at_25?: number;
  opp_xp_at_25?: number;
  opp_cs_at_25?: number;
  gold_diff_at_25?: number;
  xp_diff_at_25?: number;
  cs_diff_at_25?: number;
  kills_at_25?: number;
  assists_at_25?: number;
  deaths_at_25?: number;
  opp_kills_at_25?: number;
  opp_assists_at_25?: number;
  opp_deaths_at_25?: number;
}

/**
 * Player stats tracker for aggregating player data
 */
export interface PlayerStatsTracker {
  id: string;
  name: string;
  team: string;
  role: string;
  games: number;
  wins: number;
  kills: number;
  deaths: number;
  assists: number;
  kda: number;
  csPerMin: number;
  championPool: Set<string>;
  // Additional properties needed by playerProcessor.ts
  cs: number;
  totalDamage: number;
  championsPlayed: Set<string>;
}

/**
 * Team damage map for tracking damage per game
 * Using Record instead of Map to avoid type errors
 */
export interface TeamGameDamageMap {
  [teamId: string]: {
    [gameId: string]: number;
  };
}

/**
 * Player damage shares map
 * Using Record instead of Map to avoid type errors
 */
export interface PlayerDamageSharesMap {
  [playerId: string]: number[];
}
