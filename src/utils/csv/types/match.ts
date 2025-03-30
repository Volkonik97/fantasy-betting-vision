
// Types for match CSV data
import { PicksAndBans } from '../../leagueData/types';

export interface MatchCSV {
  id: string;
  tournament: string;
  date: string;
  teamBlueId: string;
  teamRedId: string;
  predictedWinner: string;
  blueWinOdds: string;
  redWinOdds: string;
  status: string;
  winnerTeamId?: string;
  scoreBlue?: string;
  scoreRed?: string;
  duration?: string;
  mvp?: string;
  // Team position (blue/red)
  teamPosition?: string;
  // Objectif data
  firstBlood?: string;
  firstDragon?: string;
  firstBaron?: string;
  firstHerald?: string;
  firstTower?: string;
  firstMidTower?: string;
  firstThreeTowers?: string;
  
  // Match statistics data
  patch?: string;
  year?: string;
  split?: string;
  playoffs?: string;
  teamKpm?: string;
  ckpm?: string;
  teamKills?: string;
  teamDeaths?: string;
  dragons?: string;
  elementalDrakes?: string;
  infernals?: string;
  mountains?: string;
  clouds?: string;
  oceans?: string;
  chemtechs?: string;
  hextechs?: string;
  drakesUnknown?: string;
  elders?: string;
  heralds?: string;
  barons?: string;
  voidGrubs?: string;
  towers?: string;
  turretPlates?: string;
  inhibitors?: string;
  
  // Additional data
  teamStats?: boolean;
  picks?: PicksAndBans;
  bans?: PicksAndBans;
  
  // Propriétés brutes (pour export Oracle's Elixir)
  [key: string]: any;
}
