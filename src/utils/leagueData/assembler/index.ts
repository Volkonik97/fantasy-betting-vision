
import { LeagueGameDataRow } from '../../csv/types';
import { processMatchData } from '../match/matchProcessor';
import { processTeamData } from '../teamProcessor';
import { processPlayerData } from '../playerProcessor';
import { extractTeamSpecificStats } from '../../database/matches/teamStatsExtractor';
import { AssembledLeagueData } from './types';
import { convertToApplicationModels } from './converter';
import { buildTeamMatchStatsArray } from './matchStatsBuilder';
import { buildPlayerMatchStatsArray } from './playerStatsBuilder';

/**
 * Assemble League data from raw CSV data
 * This function orchestrates the entire assembly process by delegating to specialized functions
 */
export function assembleLeagueData(data: LeagueGameDataRow[]): AssembledLeagueData {
  console.log(`Assembling League data from ${data.length} rows...`);
  
  // Process match data to get games, team stats, and player stats
  const { uniqueGames, matchStats, matchPlayerStats, matchesArray } = processMatchData(data);
  
  // Process team statistics
  const { uniqueTeams } = processTeamData(data);
  
  // Process player statistics
  const { uniquePlayers } = processPlayerData(data);
  
  // Group data by game ID to process both teams together
  const rowsByGameId = new Map<string, LeagueGameDataRow[]>();
  data.forEach(row => {
    if (row.gameid) {
      const rows = rowsByGameId.get(row.gameid) || [];
      rows.push(row);
      rowsByGameId.set(row.gameid, rows);
    }
  });
  
  // Convert data to application models
  const { teams, players, matches } = convertToApplicationModels(
    uniqueTeams,
    uniquePlayers,
    matchesArray,
    matchStats,
    rowsByGameId
  );
  
  console.log(`[assembler] Processing ${matchesArray.length} matches with ${uniqueTeams.size} teams`);
  
  // Build team match stats array
  const teamMatchStatsArray = buildTeamMatchStatsArray(matches, teams, matchStats, rowsByGameId);
  
  // Build player match stats array
  const playerMatchStatsArray = buildPlayerMatchStatsArray(matchPlayerStats);
  
  // Log dragon statistics for debugging
  const dragonStats = teamMatchStatsArray.filter(stat => 
    stat.dragons > 0 || stat.elemental_drakes > 0 || stat.infernals > 0 || 
    stat.mountains > 0 || stat.clouds > 0 || stat.oceans > 0 ||
    stat.chemtechs > 0 || stat.hextechs > 0 || stat.drakes_unknown > 0 || stat.elders > 0
  );
  
  console.log(`[assembler] Generated ${teamMatchStatsArray.length} team stats, ${dragonStats.length} with dragons`);
  
  // Return the assembled data
  return {
    teams,
    players,
    matches,
    playerMatchStats: playerMatchStatsArray,
    teamMatchStats: teamMatchStatsArray
  };
}
