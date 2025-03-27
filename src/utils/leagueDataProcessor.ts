
import { LeagueGameDataRow } from './csvTypes';
import { Team, Player, Match } from './models/types';
import { assembleLeagueData } from './leagueData/dataAssembler';

// Process League data and convert it to our application format
export const processLeagueData = (data: LeagueGameDataRow[]): {
  teams: Team[];
  players: Player[];
  matches: Match[];
  playerMatchStats: any[];
} => {
  return assembleLeagueData(data);
};
