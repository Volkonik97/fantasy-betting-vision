
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
  firstBlood?: string | boolean;
  firstDragon?: string | boolean;
  firstBaron?: string | boolean;
  firstHerald?: string | boolean;
  firstTower?: string | boolean;
  firstMidTower?: string | boolean;
  firstThreeTowers?: string | boolean;
  
  // Dragon statistics
  dragons?: string;          // Total dragons taken
  elementalDrakes?: string;  // Total elemental drakes
  infernals?: string;        // Infernal dragons
  mountains?: string;        // Mountain dragons
  clouds?: string;           // Cloud dragons
  oceans?: string;           // Ocean dragons
  chemtechs?: string;        // Chemtech dragons
  hextechs?: string;         // Hextech dragons
  drakes_unknown?: string;   // Unidentified dragons
  elders?: string;           // Elder dragons
  
  // Match statistics data
  patch?: string;
  year?: string;
  split?: string;
  playoffs?: string;
  teamKpm?: string;
  ckpm?: string;
  teamKills?: string;
  teamDeaths?: string;
  
  heralds?: string;
  barons?: string;
  voidGrubs?: string;
  towers?: string;
  turretPlates?: string;
  inhibitors?: string;
  
  // Additional data
  teamStats?: boolean;
  picks?: PicksAndBans | string;
  bans?: PicksAndBans | string;
  
  // Propriétés brutes (pour export Oracle's Elixir)
  [key: string]: any;
}
