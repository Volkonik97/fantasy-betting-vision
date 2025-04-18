
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
  vspm?: number;
  wcpm?: number;
  goldSharePercent?: number;
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
  // References
  players?: Player[];
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
}

export interface Tournament {
  id: string;
  name: string;
  region: string;
  startDate: string;
  endDate: string;
  matches?: Match[];
}
