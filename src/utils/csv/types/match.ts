
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
  oppDragons?: string;
  elementalDrakes?: string;
  oppElementalDrakes?: string;
  infernals?: string;
  mountains?: string;
  clouds?: string;
  oceans?: string;
  chemtechs?: string;
  hextechs?: string;
  drakesUnknown?: string;
  elders?: string;
  oppElders?: string;
  heralds?: string;
  oppHeralds?: string;
  barons?: string;
  oppBarons?: string;
  voidGrubs?: string;
  oppVoidGrubs?: string;
  towers?: string;
  oppTowers?: string;
  turretPlates?: string;
  oppTurretPlates?: string;
  inhibitors?: string;
  oppInhibitors?: string;
  
  // Additional data
  teamStats?: boolean;
  picks?: PicksAndBans;
  bans?: PicksAndBans;
  
  // Propriétés brutes (pour export Oracle's Elixir)
  [key: string]: any;
}
