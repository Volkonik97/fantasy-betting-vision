
import { LeagueGameDataRow } from './csv/types';
import { Team, Player, Match } from './models/types';
import { assembleLeagueData } from './leagueData/dataAssembler';

// Process League data and convert it to our application format
export const processLeagueData = (data: LeagueGameDataRow[]): {
  teams: Team[];
  players: Player[];
  matches: Match[];
  playerMatchStats: any[];
  teamMatchStats: any[];
} => {
  console.log(`Processing ${data.length} rows of League data into application format...`);
  const result = assembleLeagueData(data);
  
  console.log(`Processed League data: ${result.teams.length} teams, ${result.players.length} players, ${result.matches.length} matches, ${result.playerMatchStats.length} player match stats, ${result.teamMatchStats.length} team match stats`);
  
  // Log a sample of player match stats for debugging
  if (result.playerMatchStats.length > 0) {
    console.log("Sample player match stat:", JSON.stringify(result.playerMatchStats[0]));
  }
  
  // Log a sample of team match stats for debugging
  if (result.teamMatchStats.length > 0) {
    console.log("Sample team match stat:", JSON.stringify(result.teamMatchStats[0]));
  }
  
  return result;
};
