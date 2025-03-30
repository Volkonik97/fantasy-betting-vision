
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
 * Team stats tracker for aggregating team data
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
  // Additional properties needed by teamProcessor.ts
  losses: number;
  blueWins: number;
  blueLosses: number;
  redWins: number;
  redLosses: number;
  gameTimes: number[];
}
