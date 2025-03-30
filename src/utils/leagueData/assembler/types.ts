
import { Match, Player, Team } from '../../models/types';

export interface AssembledLeagueData {
  teams: Team[];
  players: Player[];
  matches: Match[];
  playerMatchStats: any[];
  teamMatchStats: any[];
}

export interface TeamRowsProcessResult {
  dragons: number;
  elementalDrakes: number;
  infernals: number;
  mountains: number;
  clouds: number;
  oceans: number;
  chemtechs: number;
  hextechs: number;
  drakesUnknown: number;
  elders: number;
  heralds: number;
  barons: number;
  towers: number;
  turretPlates: number;
  inhibitors: number;
  voidGrubs: number;
  team_kpm: number;
  ckpm: number;
  kills: number;
  deaths: number;
  first_blood: boolean;
  first_dragon: boolean;
  first_herald: boolean;
  first_baron: boolean;
  first_tower: boolean;
  first_mid_tower: boolean;
  first_three_towers: boolean;
  team_id: string;
  match_id: string;
  is_blue_side: boolean;
}
