
// Common types used across the application
export interface Team {
  id: string;
  name: string;
  region: string;
  logo?: string;
  players?: Player[];
  winRate: number;
  blueWinRate: number;
  redWinRate: number;
  averageGameTime: number;
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
}

export type PlayerRole = 'Top' | 'Jungle' | 'Mid' | 'ADC' | 'Support' | 'Unknown';

export interface Player {
  id: string;
  name: string;
  role: PlayerRole;
  image: string;
  team: string;
  teamName?: string;  // Added teamName as an optional property
  teamRegion?: string; // Added teamRegion as an optional property
  kda: number;
  csPerMin: number;
  damageShare: number;
  championPool: string[] | string;
}

export interface Match {
  id: string;
  tournament: string;
  date: string;
  teamBlue: Team;
  teamRed: Team;
  predictedWinner: string;
  blueWinOdds: number;
  redWinOdds: number;
  status: 'Upcoming' | 'Live' | 'Completed';
  result?: {
    winner: string;
    score: [number, number];
    duration: string | number;
    mvp?: string;
    firstBlood?: string | boolean;
    firstDragon?: string | boolean;
    firstBaron?: string | boolean;
    firstHerald?: string | boolean;
    firstTower?: string | boolean;
  };
  extraStats?: {
    patch?: string;
    year?: string;
    split?: string;
    playoffs?: boolean;
    team_kpm?: number;
    ckpm?: number;
    team_kills?: number;
    team_deaths?: number;
    dragons?: number;
    opp_dragons?: number;
    elemental_drakes?: number;
    opp_elemental_drakes?: number;
    infernals?: number;
    mountains?: number;
    clouds?: number;
    oceans?: number;
    chemtechs?: number;
    hextechs?: number;
    drakes_unknown?: number;
    // Add the opponent drake-specific properties
    opp_infernals?: number;
    opp_mountains?: number;
    opp_clouds?: number;
    opp_oceans?: number;
    opp_chemtechs?: number;
    opp_hextechs?: number;
    opp_drakes_unknown?: number;
    elders?: number;
    opp_elders?: number;
    first_herald?: string | boolean;
    heralds?: number;
    opp_heralds?: number;
    barons?: number;
    opp_barons?: number;
    void_grubs?: number;
    opp_void_grubs?: number;
    first_tower?: string | boolean;
    first_mid_tower?: string | boolean;
    first_three_towers?: string | boolean;
    towers?: number;
    opp_towers?: number;
    turret_plates?: number;
    opp_turret_plates?: number;
    inhibitors?: number;
    opp_inhibitors?: number;
    blueTeamStats?: any;
    redTeamStats?: any;
    first_blood?: string | boolean;
    first_dragon?: string | boolean;
    first_baron?: string | boolean;
    // Ensure picks and bans properties are properly defined
    picks?: any;
    bans?: any;
    // Properly define game_number as a string or number
    game_number?: string | number;
  };
  playerStats?: any[];
}

export interface Tournament {
  id: string;
  name: string;
  region: string;
  startDate: string;
  endDate: string;
  logo: string;
}

// TimelineStatPoint for timeline stats
export interface TimelineStatPoint {
  avgGold: number;
  avgXp: number;
  avgCs: number;
  avgGoldDiff: number;
  avgCsDiff: number;
  avgKills: number;
  avgDeaths: number;
  avgAssists?: number;
}

// Type for timeline statistics by time point - update to use string indices
export interface TimelineStats {
  [timePoint: string]: TimelineStatPoint;
}

// Side-based statistics (blue/red)
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
  blueFirstBaron?: number;  
  redFirstBaron?: number;
  timelineStats?: TimelineStats;
}
