
import { LeagueGameDataRow } from './csvTypes';
import { Team, Player, Match } from './mockData';
import { assembleLeagueData } from './leagueData/dataAssembler';

// Process League data and convert it to our application format
export const processLeagueData = (data: LeagueGameDataRow[]): {
  teams: Team[];
  players: Player[];
  matches: Match[];
} => {
  return assembleLeagueData(data);
};
