
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
  losses: number; // Added missing property
  blueGames: number;
  blueWins: number;
  blueLosses: number; // Added missing property
  redGames: number;
  redWins: number;
  redLosses: number; // Added missing property
  kills: number;
  deaths: number;
  dragons: number;
  heralds: number;
  barons: number;
  towers: number;
  totalGameTime: number;
  gameTimes: number[]; // Added missing property
  logo?: string; // Added missing property
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
