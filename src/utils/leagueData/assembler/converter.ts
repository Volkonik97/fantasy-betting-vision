
import { LeagueGameDataRow } from '../../csv/types';
import { Match, Player, Team } from '../../models/types';
import { teamToTeamObject, playerToPlayerObject } from './modelConverter';
import { processMatchObject } from './matchProcessor';

/**
 * Convert raw CSV data to application models
 */
export function convertToApplicationModels(
  uniqueTeams: Map<string, any>,
  uniquePlayers: Map<string, any>,
  matchesArray: any[],
  matchStats: Map<string, Map<string, any>>,
  rowsByGameId: Map<string, LeagueGameDataRow[]>
): {
  teams: Team[];
  players: Player[];
  matches: Match[];
} {
  // Convert teams to application model
  const teams: Team[] = Array.from(uniqueTeams.values()).map(teamToTeamObject);
  
  // Convert players to application model
  const players: Player[] = Array.from(uniquePlayers.values()).map(playerCsv => 
    playerToPlayerObject(playerCsv)
  );
  
  // Convert matches to application model
  const matches: Match[] = matchesArray
    .map(match => {
      const gameRows = rowsByGameId.get(match.id) || [];
      return processMatchObject(match, teams, matchStats, gameRows);
    })
    .filter(Boolean) as Match[];
  
  return { teams, players, matches };
}
