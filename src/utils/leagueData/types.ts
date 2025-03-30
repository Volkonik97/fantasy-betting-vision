
import { LeagueGameDataRow } from '../csv/types';

/**
 * GameTracker interface for tracking unique games
 */
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

/**
 * Match team statistics interface
 */
export interface MatchTeamStats {
  team_id: string;
  match_id: string;
  side: string;
  is_winner: boolean;
  team_kpm?: number;
  ckpm?: number;
  first_blood?: boolean;
  team_kills?: number;
  team_deaths?: number;
  first_dragon?: boolean;
  dragons?: number;
  elemental_drakes?: number;
  infernals?: number;
  mountains?: number;
  clouds?: number;
  oceans?: number;
  chemtechs?: number;
  hextechs?: number;
  drakes_unknown?: number;
  elders?: number;
  first_herald?: boolean;
  heralds?: number;
  first_baron?: boolean;
  barons?: number;
  void_grubs?: number;
  first_tower?: boolean;
  first_mid_tower?: boolean;
  first_three_towers?: boolean;
  towers?: number;
  turret_plates?: number;
  inhibitors?: number;
}

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
 * Picks and Bans interface
 */
export interface PicksAndBans {
  picks?: Record<string, string[]>;
  bans?: Record<string, string[]>;
}

/**
 * Player stats tracker for aggregating player data
 * Updated with missing properties
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
  // Add missing properties used in playerProcessor.ts
  cs: number;
  totalDamage: number;
  championsPlayed: Set<string>;
}

/**
 * Team damage map for tracking damage per game
 * Changed from Map to Record to avoid type errors
 */
export interface TeamGameDamageMap {
  [teamId: string]: {
    [gameId: string]: number;
  };
}

/**
 * Player damage shares map
 * Changed from Map to Record to avoid type errors
 */
export interface PlayerDamageSharesMap {
  [playerId: string]: number[];
}

/**
 * Team stats tracker for aggregating team data
 * Updated with missing properties
 */
export interface TeamStatsTracker {
  id: string;
  name: string;
  logo?: string;
  region?: string;
  subRegion?: string;
  games: number;
  wins: number;
  players: string[];
  // Add missing properties used in teamProcessor.ts
  losses: number;
  blueWins: number;
  blueLosses: number;
  redWins: number;
  redLosses: number;
  gameTimes: number[];
}

/**
 * Parse a string value to a float safely
 */
export function safeParseFloat(value: any): number {
  if (value === undefined || value === null) return 0;
  
  if (typeof value === 'number') return value;
  
  if (typeof value === 'string') {
    const parsedValue = parseFloat(value);
    return isNaN(parsedValue) ? 0 : parsedValue;
  }
  
  return 0;
}

/**
 * Parse a string value to an integer safely
 */
export function safeParseInt(value: any): number {
  if (value === undefined || value === null) return 0;
  
  if (typeof value === 'number') return Math.floor(value);
  
  if (typeof value === 'string') {
    const parsedValue = parseInt(value, 10);
    return isNaN(parsedValue) ? 0 : parsedValue;
  }
  
  return 0;
}

/**
 * Parse a value to boolean safely
 */
export function parseBoolean(value: any): boolean {
  if (value === undefined || value === null) return false;
  
  if (typeof value === 'boolean') return value;
  
  if (typeof value === 'string') {
    const lowerValue = value.toLowerCase();
    return lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes';
  }
  
  if (typeof value === 'number') {
    return value === 1;
  }
  
  return false;
}

/**
 * Convert boolean to string representation
 */
export function booleanToString(value: boolean | string | undefined | null): string | null {
  if (value === undefined || value === null) return null;
  
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }
  
  return value;
}

/**
 * Prepares JSON data for database storage, ensuring it's in a proper format
 */
export function prepareJsonData(data: any): any {
  if (!data) return null;
  
  try {
    // If it's already a string, try to parse it
    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch {
        // If not valid JSON, return as is
        return data;
      }
    } 
    
    // If it's already an object, stringify and re-parse to ensure deep cloning
    // and to remove any circular references
    return JSON.parse(JSON.stringify(data));
  } catch (error) {
    console.error("Error preparing JSON data:", error);
    console.log("Original data type:", typeof data);
    
    if (typeof data === 'object') {
      console.log("Object keys:", Object.keys(data));
    }
    
    // Return null on error to avoid database issues
    return null;
  }
}
