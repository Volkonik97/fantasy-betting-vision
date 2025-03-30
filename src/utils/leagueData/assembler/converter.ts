
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

/**
 * Helper function to convert team CSV to team object
 */
function teamToTeamObject(teamCsv: any): Team {
  return {
    id: teamCsv.id,
    name: teamCsv.name,
    logo: teamCsv.logo,
    region: teamCsv.region,
    winRate: parseFloat(teamCsv.winRate) || 0,
    blueWinRate: parseFloat(teamCsv.blueWinRate) || 0,
    redWinRate: parseFloat(teamCsv.redWinRate) || 0,
    averageGameTime: parseFloat(teamCsv.averageGameTime) || 0,
    players: [] // Will be filled later
  };
}

/**
 * Helper function to convert player CSV to player object
 */
function playerToPlayerObject(playerCsv: any): Player {
  return {
    id: playerCsv.id,
    name: playerCsv.name,
    role: playerCsv.role as 'Top' | 'Jungle' | 'Mid' | 'ADC' | 'Support',
    image: playerCsv.image,
    team: playerCsv.team,
    kda: parseFloat(playerCsv.kda) || 0,
    csPerMin: parseFloat(playerCsv.csPerMin) || 0,
    damageShare: parseFloat(playerCsv.damageShare) || 0,
    championPool: playerCsv.championPool ? playerCsv.championPool.split(',').map((champ: string) => champ.trim()) : []
  };
}
