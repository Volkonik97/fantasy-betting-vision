import { LeagueGameDataRow } from '../csvTypes';

// Types for team statistics tracking
export interface TeamStatsTracker {
  wins: number;
  losses: number;
  blueWins: number;
  blueLosses: number;
  redWins: number;
  redLosses: number;
  gameTimes: number[];
}

// Types for player statistics tracking
export interface PlayerStatsTracker {
  kills: number;
  deaths: number;
  assists: number;
  games: number;
  cs: number;
  totalDamage: number;
  championsPlayed: Set<string>;
}

// Types for game tracking
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
  result: string | undefined;
  duration: string | undefined;
}

// Types for team damage tracking
export type TeamGameDamageMap = Map<string, Map<string, number>>;
export type PlayerDamageSharesMap = Map<string, number[]>;

// Types for match level statistics
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
  opp_dragons: number;
  elemental_drakes: number;
  opp_elemental_drakes: number;
  infernals: number;
  mountains: number;
  clouds: number;
  oceans: number;
  chemtechs: number;
  hextechs: number;
  drakes_unknown: number;
  elders: number;
  opp_elders: number;
  first_herald: boolean;
  heralds: number;
  opp_heralds: number;
  first_baron: boolean;
  barons: number;
  opp_barons: number;
  void_grubs: number;
  opp_void_grubs: number;
  first_tower: boolean;
  first_mid_tower: boolean;
  first_three_towers: boolean;
  towers: number;
  opp_towers: number;
  turret_plates: number;
  opp_turret_plates: number;
  inhibitors: number;
  opp_inhibitors: number;
}

// Types for player match statistics
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
  
  // Timeline stats (abbreviated for brevity)
  [key: string]: string | number | boolean;
}

// Results from league data processing
export interface LeagueDataProcessingResult {
  teamStats: Map<string, TeamStatsTracker>;
  playerStats: Map<string, PlayerStatsTracker>;
  teamGameDamage: TeamGameDamageMap;
  playerDamageShares: PlayerDamageSharesMap;
  uniqueGames: Map<string, GameTracker>;
  matchStats: Map<string, Map<string, MatchTeamStats>>;
  matchPlayerStats: Map<string, Map<string, PlayerMatchStats>>;
}

// Function to parse a boolean from various string formats
export function parseBoolean(value: string | undefined): boolean {
  if (!value) return false;
  
  const lowerValue = value.toLowerCase().trim();
  return lowerValue === '1' || lowerValue === 'true' || lowerValue === 'yes';
}

// Function to safely parse a number
export function safeParseInt(value: string | undefined): number {
  if (!value) return 0;
  const parsed = parseInt(value);
  return isNaN(parsed) ? 0 : parsed;
}

export function safeParseFloat(value: string | undefined): number {
  if (!value) return 0;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
}
