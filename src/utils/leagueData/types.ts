
import { LeagueGameDataRow } from '../csv/types';

// GameTracker interface for tracking unique games
export interface GameTracker {
  id: string;
  date: string;
  league: string;
  year: string;
  split: string;
  patch: string;
  playoffs: boolean;
  teams: {
    blue: string;
    red: string;
  };
  result?: string;
  duration?: string;
  rows?: Set<LeagueGameDataRow>;
}

// Team statistics for each match
export interface MatchTeamStats {
  team_id: string;
  match_id: string;
  side: string;
  is_winner: boolean;
  team_kpm: number;
  ckpm: number;
  first_blood: boolean;
  team_kills: number;
  team_deaths: number;
  first_dragon: boolean;
  dragons: number;
  elemental_drakes: number;
  infernals: number;
  mountains: number;
  clouds: number;
  oceans: number;
  chemtechs: number;
  hextechs: number;
  drakes_unknown: number;
  elders: number;
  first_herald: boolean;
  heralds: number;
  first_baron: boolean;
  barons: number;
  void_grubs: number;
  first_tower: boolean;
  first_mid_tower: boolean;
  first_three_towers: boolean;
  towers: number;
  turret_plates: number;
  inhibitors: number;
}

// Player statistics for each match
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
  double_kills: number;
  triple_kills: number;
  quadra_kills: number;
  penta_kills: number;
  first_blood_kill: boolean;
  first_blood_assist: boolean;
  first_blood_victim: boolean;
  
  // Damage stats
  damage_to_champions: number;
  dpm: number;
  damage_share: number;
  damage_taken_per_minute: number;
  damage_mitigated_per_minute: number;
  
  // Vision stats
  wards_placed: number;
  wpm: number;
  wards_killed: number;
  wcpm: number;
  control_wards_bought: number;
  vision_score: number;
  vspm: number;
  
  // Gold stats
  total_gold: number;
  earned_gold: number;
  earned_gpm: number;
  earned_gold_share: number;
  gold_spent: number;
  gspd: number;
  gpr: number;
  
  // CS stats
  total_cs: number;
  minion_kills: number;
  monster_kills: number;
  monster_kills_own_jungle: number;
  monster_kills_enemy_jungle: number;
  cspm: number;
  
  // Timeline stats (10, 15, 20, 25 minutes)
  gold_at_10: number;
  xp_at_10: number;
  cs_at_10: number;
  opp_gold_at_10: number;
  opp_xp_at_10: number;
  opp_cs_at_10: number;
  gold_diff_at_10: number;
  xp_diff_at_10: number;
  cs_diff_at_10: number;
  kills_at_10: number;
  assists_at_10: number;
  deaths_at_10: number;
  opp_kills_at_10: number;
  opp_assists_at_10: number;
  opp_deaths_at_10: number;
  
  gold_at_15: number;
  xp_at_15: number;
  cs_at_15: number;
  opp_gold_at_15: number;
  opp_xp_at_15: number;
  opp_cs_at_15: number;
  gold_diff_at_15: number;
  xp_diff_at_15: number;
  cs_diff_at_15: number;
  kills_at_15: number;
  assists_at_15: number;
  deaths_at_15: number;
  opp_kills_at_15: number;
  opp_assists_at_15: number;
  opp_deaths_at_15: number;
  
  gold_at_20: number;
  xp_at_20: number;
  cs_at_20: number;
  opp_gold_at_20: number;
  opp_xp_at_20: number;
  opp_cs_at_20: number;
  gold_diff_at_20: number;
  xp_diff_at_20: number;
  cs_diff_at_20: number;
  kills_at_20: number;
  assists_at_20: number;
  deaths_at_20: number;
  opp_kills_at_20: number;
  opp_assists_at_20: number;
  opp_deaths_at_20: number;
  
  gold_at_25: number;
  xp_at_25: number;
  cs_at_25: number;
  opp_gold_at_25: number;
  opp_xp_at_25: number;
  opp_cs_at_25: number;
  gold_diff_at_25: number;
  xp_diff_at_25: number;
  cs_diff_at_25: number;
  kills_at_25: number;
  assists_at_25: number;
  deaths_at_25: number;
  opp_kills_at_25: number;
  opp_assists_at_25: number;
  opp_deaths_at_25: number;
}

// Picks and bans interface
export interface PicksAndBans {
  picks?: Record<string, string[]>;
  bans?: Record<string, string[]>;
}

// Player stats tracker interface
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
  cs: number;
  totalDamage: number;
  championsPlayed: Set<string>;
}

// Team stats tracker interface
export interface TeamStatsTracker {
  id: string;
  name: string;
  region: string;
  games: number;
  wins: number;
  blueGames: number;
  blueWins: number;
  redGames: number;
  redWins: number;
  firstBloods: number;
  firstDragons: number;
  firstHeralds: number;
  firstBarons: number;
  firstTowers: number;
  dragons: number;
  heralds: number;
  barons: number;
  towers: number;
  kills: number;
  deaths: number;
  averageGameTime: number;
}

// Team game damage tracking
export interface TeamGameDamageMap {
  [teamId: string]: {
    [gameId: string]: number;
  }
}

// Player damage shares tracking
export interface PlayerDamageSharesMap {
  [playerId: string]: number[];
}

// Timeline stats interface
export interface TimelineStats {
  [time: string]: {
    gold: number;
    xp: number;
    cs: number;
  }
}

// Re-export utility functions (these will be imported from the utils.ts file)
export { safeParseFloat, safeParseInt, parseBoolean, booleanToString, prepareJsonData } from './utils';
