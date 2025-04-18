
export type PlayerRole = "Top" | "Jungle" | "Mid" | "ADC" | "Support" | "Unknown";

export interface Player {
  id: string;
  name: string;
  role: "Top" | "Jungle" | "Mid" | "ADC" | "Support" | "Unknown";
  team: string;
  kda: number;
  csPerMin: number;
  killParticipation: number;
  championPool: string;
  image: string;
  // Statistics fields
  damageShare?: number;
  vspm?: number;
  wcpm?: number;
  goldSharePercent?: number;
  // Additional fields from player_summary_view
  avg_kills?: number;
  avg_deaths?: number;
  avg_assists?: number;
  cspm?: number;
  gold_share_percent?: number;
  earned_gold_share?: number;
  dmg_per_gold?: number;
  match_count?: number;
  dpm?: number;
  efficiency_score?: number;
  aggression_score?: number;
  earlygame_score?: number;
  kill_participation_pct?: number;
  // Fields for UI purposes
  teamName?: string;
  teamRegion?: string;
}

export interface Team {
  id: string;
  name: string;
  slug?: string;
  logo: string;
  region: string;
  // Team statistics
  winRate?: number;
  blueWinRate?: number;
  redWinRate?: number;
  averageGameTime?: number;
  // First objective statistics
  blueFirstBlood?: number;
  redFirstBlood?: number;
  blueFirstDragon?: number;
  redFirstDragon?: number;
  blueFirstHerald?: number;
  redFirstHerald?: number;
  blueFirstTower?: number;
  redFirstTower?: number;
  blueFirstBaron?: number;
  redFirstBaron?: number;
  // References
  players?: Player[];
  // Additional team stats fields
  firstblood_pct?: number;
  firstdragon_pct?: number;
  avg_dragons?: number;
  avg_dragons_against?: number;
  avg_towers?: number;
  avg_towers_against?: number;
  avg_kills?: number;
  avg_kill_diff?: number;
  avg_heralds?: number;
  avg_void_grubs?: number;
  aggression_score?: number;
  earlygame_score?: number;
  objectives_score?: number;
  dragon_diff?: number;
  tower_diff?: number;
}

export interface MatchResult {
  winner: string;
  score: [number, number];
  duration: string | number;
  mvp?: string;
  firstBlood?: string | boolean;
  firstDragon?: string | boolean;
  firstBaron?: string | boolean;
  firstHerald?: string | boolean;
  firstTower?: string | boolean;
}

export interface Match {
  id: string;
  gameId?: string;
  platformGameId?: string;
  gameCreation?: number;
  gameDuration?: number;
  gameVersion?: string;
  queueId?: number;
  mapId?: number;
  seasonId?: number;
  date: string;
  tournament: string;
  status: 'Upcoming' | 'Live' | 'Completed';
  teamBlue: Team;
  teamRed: Team;
  predictedWinner: string;
  blueWinOdds: number;
  redWinOdds: number;
  result?: MatchResult;
  extraStats?: any;
  teams?: Team[];
  players?: Player[];
}

// Timeline statistics for side analysis
export interface TimelineStatPoint {
  avgGold: number;
  avgGoldDiff: number;
  avgCs: number;
  avgCsDiff: number;
  avgKills: number;
  avgDeaths: number;
  avgAssists?: number;
  avgXp?: number;  // Added for TimelineChart
}

export interface TimelineStats {
  [time: string]: TimelineStatPoint;
}

export interface SideStatistics {
  blueWins: number;
  redWins: number;
  blueFirstBlood?: number;
  redFirstBlood?: number;
  blueFirstDragon?: number;
  redFirstDragon?: number;
  blueFirstHerald?: number;
  redFirstHerald?: number;
  blueFirstTower?: number;
  redFirstTower?: number;
  blueFirstBaron?: number;
  redFirstBaron?: number;
  timelineStats?: TimelineStats;
  teamId?: string; // Added for sideStatisticsService
}

export interface Tournament {
  id: string;
  name: string;
  region: string;
  startDate: string;
  endDate: string;
  matches?: Match[];
  logo?: string; // Added for use in Tournaments.tsx
}
