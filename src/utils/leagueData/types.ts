// Define types for league data processing

// Player Statistics Tracker
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
  cs: number;
  totalDamage: number;
  championsPlayed: Set<string>;
  championPool: Set<string>;
}

// Team Statistics Tracker
export interface TeamStatsTracker {
  id: string;
  name: string;
  region: string;
  games: number;
  wins: number;
  losses: number; 
  blueGames: number;
  blueWins: number;
  blueLosses: number; 
  redGames: number;
  redWins: number;
  redLosses: number; 
  kills: number;
  deaths: number;
  dragons: number;
  heralds: number;
  barons: number;
  towers: number;
  totalGameTime: number;
  gameTimes: number[];
  logo?: string;
  players?: any[];
}

// Map of team ID to team statistics
export type TeamStatsMap = Map<string, TeamStatsTracker>;

// Map of player ID to player statistics 
export type PlayerStatsMap = Map<string, PlayerStatsTracker>;

// Map of team ID to game ID to total damage
export interface TeamGameDamageMap {
  [teamId: string]: {
    [gameId: string]: number;
  }
}

// Map of player ID to damage share per game
export interface PlayerDamageSharesMap {
  [playerId: string]: number[];
}

// Side Statistics structure
export interface SideStatistics {
  teamId: string;
  blueWins: number;
  redWins: number;
  blueFirstBlood: number;
  redFirstBlood: number;
  blueFirstDragon: number;
  redFirstDragon: number;
  blueFirstHerald: number;
  redFirstHerald: number;
  blueFirstTower: number;
  redFirstTower: number;
  blueFirstBaron: number;
  redFirstBaron: number;
  timelineStats: TimelineStats;
}

// Timeline Stats at specific points in the game (10, 15, 20, 25 minutes)
export interface TimelineStats {
  [timePoint: string]: TimelineStatPoint;
}

// Statistics at a specific time point
export interface TimelineStatPoint {
  avgGold: number;
  avgXp: number;
  avgCs: number;
  avgGoldDiff: number;
  avgCsDiff: number;
  avgKills: number;
  avgDeaths: number;
  avgAssists: number;
}

// Picks and Bans structure
export interface PicksAndBans {
  blueBans: string[];
  redBans: string[];
  bluePicks: string[];
  redPicks: string[];
}

// Structure for match completion result
export interface MatchResult {
  winner: string;
  score: [number, number];
  duration: number;
  mvp?: string;
}

// Game tracker for match data processing
export interface GameTracker {
  id: string;
  league?: string;
  date?: string;
  teams: {
    blue: string;
    red: string;
  };
  rows?: Set<any>;
  result?: {
    winner: string;
    duration: string;
  };
}

// Match team statistics
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

// Player match statistics
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
  
  // Timeline stats
  gold_at_10?: number;
  xp_at_10?: number;
  cs_at_10?: number;
  gold_diff_at_10?: number;
  xp_diff_at_10?: number;
  cs_diff_at_10?: number;
  kills_at_10?: number;
  deaths_at_10?: number;
  assists_at_10?: number;
  
  // Additional timeline stats (15, 20, 25 minutes)
  // ... other timeline stats 
}
