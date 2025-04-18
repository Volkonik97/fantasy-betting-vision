
export type PlayerRole = "Top" | "Jungle" | "Mid" | "ADC" | "Support" | "Unknown";

export interface Player {
  id: string;
  name: string;
  role: string; 
  image: string;
  team: string;
  kda: number;
  csPerMin: number;
  damageShare: number;
  killParticipation: number;
  kill_participation_pct: number;
  championPool: string;
  // Extended properties for TeamPlayersList
  teamName?: string;
  teamRegion?: string;
  // Properties from database that might be available
  cspm?: number;
  earned_gold_share?: number;
  // Timeline stats
  golddiffat15?: number;
  xpdiffat15?: number;
  csdiffat15?: number;
  // Additional stats that might be available from database
  dpm?: number;
  vspm?: number;
  wcpm?: number;
  gold_share_percent?: number;
  dmg_per_gold?: number;
  avg_kills?: number;
  avg_deaths?: number;
  avg_assists?: number;
  match_count?: number;
  efficiency_score?: number;
  aggression_score?: number;
  earlygame_score?: number;
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
  // Additional fields from database
  avg_golddiffat15?: number;
  avg_xpdiffat15?: number;
  avg_csdiffat15?: number;
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

export interface TimelineStatPoint {
  avgGold: number;
  avgGoldDiff: number;
  avgCs: number;
  avgCsDiff: number;
  avgKills: number;
  avgDeaths: number;
  avgAssists?: number;
  avgXp?: number;
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
  teamId?: string;
}

export interface Tournament {
  id: string;
  name: string;
  region: string;
  startDate: string;
  endDate: string;
  matches?: Match[];
  logo?: string;
}
