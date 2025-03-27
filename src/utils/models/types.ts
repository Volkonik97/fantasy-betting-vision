
// Common types used across the application
export interface Team {
  id: string;
  name: string;
  logo: string;
  region: string;
  winRate: number;
  blueWinRate: number;
  redWinRate: number;
  averageGameTime: number;
  players: Player[];
}

export interface Player {
  id: string;
  name: string;
  role: 'Top' | 'Jungle' | 'Mid' | 'ADC' | 'Support';
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
    duration?: string;
    mvp?: string;
    firstBlood?: string;
    firstDragon?: string;
    firstBaron?: string;
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
    elders?: number;
    opp_elders?: number;
    first_herald?: string;
    heralds?: number;
    opp_heralds?: number;
    barons?: number;
    opp_barons?: number;
    first_tower?: string;
    first_mid_tower?: string;
    first_three_towers?: string;
    towers?: number;
    opp_towers?: number;
    turret_plates?: number;
    opp_turret_plates?: number;
    inhibitors?: number;
    opp_inhibitors?: number;
    void_grubs?: number;
    opp_void_grubs?: number;
    blueTeamStats?: any;
    redTeamStats?: any;
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

export interface SideStatistics {
  teamId?: string; // Added to track which team these stats belong to
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
  timelineStats?: {
    [key: string]: {
      avgGold: number;
      avgXp: number;
      avgCs: number;
      avgGoldDiff: number;
      avgCsDiff?: number;
      avgKills: number;
      avgDeaths: number;
      avgAssists?: number;
    }
  };
}
