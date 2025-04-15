// Common types used across the application
export interface Team {
  id: string;
  name: string;
  region: string;
  logo?: string;
  players?: Player[];
  
  // Naming properties to match database fields
  winRate: number;
  blueWinRate: number;
  redWinRate: number;
  averageGameTime: number;
  
  // First objective stats
  firstblood_pct?: number;
  blueFirstBlood?: number;
  redFirstBlood?: number;
  firstdragon_pct?: number;
  blueFirstDragon?: number;
  redFirstDragon?: number;
  blueFirstHerald?: number;
  redFirstHerald?: number;
  blueFirstTower?: number;
  redFirstTower?: number;
  blueFirstBaron?: number;  
  redFirstBaron?: number;
  
  // Stats fields that are being used in the code
  avg_towers?: number;
  avg_dragons?: number;
  avg_kill_diff?: number;
  avg_kills?: number;
  avg_dragons_against?: number;
  avg_towers_against?: number;
  avg_heralds?: number;
  avg_void_grubs?: number;
  
  // Fields for time-based differentials
  avg_golddiffat15?: number;
  avg_xpdiffat15?: number;
  avg_csdiffat15?: number;
  
  // Score fields from team_summary_view
  aggression_score?: number;
  earlygame_score?: number;
  objectives_score?: number;
  dragon_diff?: number;
  tower_diff?: number;
}

export type PlayerRole = 'Top' | 'Jungle' | 'Mid' | 'ADC' | 'Support' | 'Unknown';

export interface Player {
  id: string;
  name: string;
  role: PlayerRole;
  image: string;
  team: string; // This is mapped to team_id in database
  teamName?: string;
  teamRegion?: string;
  kda: number;
  csPerMin: number; // Database uses cspm
  damageShare: number; // Database uses damage_share
  championPool: string[] | string;
  
  // Adding fields that are used in database but not defined in the interface
  avg_kills?: number;
  avg_deaths?: number;
  avg_assists?: number;
  cspm?: number;
  dpm?: number;
  earned_gpm?: number;
  earned_gold_share?: number;
  gold_share_percent?: number; // Adding this property to match the player_summary_view column
  vspm?: number;
  wcpm?: number;
  
  // Early game stats
  avg_golddiffat15?: number;
  avg_xpdiffat15?: number;
  avg_csdiffat15?: number;
  
  // First blood stats
  avg_firstblood_kill?: number;
  avg_firstblood_assist?: number;
  avg_firstblood_victim?: number;
  
  match_count?: number; // Number of matches played by the player
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
