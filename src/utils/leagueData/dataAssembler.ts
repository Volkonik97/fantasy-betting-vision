import { LeagueGameDataRow } from '../csvTypes';
import { Team, Player, Match } from '../models/types';
import { processTeamData } from './teamProcessor';
import { processPlayerData } from './playerProcessor';
import { processMatchData } from './matchProcessor';

export function assembleLeagueData(data: LeagueGameDataRow[]): {
  teams: Team[];
  players: Player[];
  matches: Match[];
  playerMatchStats: any[]; // Add playerMatchStats to the return type
} {
  console.log(`Started processing ${data.length} rows of league data`);
  
  // Process team data
  const { uniqueTeams, teamStats } = processTeamData(data);
  
  // Process player data
  const { uniquePlayers } = processPlayerData(data);
  
  // Process match data
  const { uniqueGames, matchStats, matchPlayerStats, matchesArray } = processMatchData(data);
  
  // Convert Map to array for teams
  const teamsArray = Array.from(uniqueTeams.values()).map(team => ({
    id: team.id,
    name: team.name,
    logo: team.logo || '',
    region: team.region || '',
    winRate: teamStats.get(team.id)?.wins 
      ? teamStats.get(team.id)!.wins / (teamStats.get(team.id)!.wins + teamStats.get(team.id)!.losses) 
      : 0,
    blueWinRate: teamStats.get(team.id)?.blueWins && (teamStats.get(team.id)!.blueWins + teamStats.get(team.id)!.blueLosses) > 0
      ? teamStats.get(team.id)!.blueWins / (teamStats.get(team.id)!.blueWins + teamStats.get(team.id)!.blueLosses)
      : 0,
    redWinRate: teamStats.get(team.id)?.redWins && (teamStats.get(team.id)!.redWins + teamStats.get(team.id)!.redLosses) > 0
      ? teamStats.get(team.id)!.redWins / (teamStats.get(team.id)!.redWins + teamStats.get(team.id)!.redLosses)
      : 0,
    averageGameTime: teamStats.get(team.id)?.gameTimes && teamStats.get(team.id)!.gameTimes.length > 0
      ? teamStats.get(team.id)!.gameTimes.reduce((sum, time) => sum + time, 0) / teamStats.get(team.id)!.gameTimes.length
      : 0,
    players: [] 
  }));
  
  // Convert Map to array for players
  const playersArray = Array.from(uniquePlayers.values()).map(player => ({
    id: player.id,
    name: player.name,
    role: player.role as 'Top' | 'Jungle' | 'Mid' | 'ADC' | 'Support',
    image: player.image || '',
    team: player.team,
    kda: Number(player.kda) || 0,
    csPerMin: Number(player.csPerMin) || 0,
    damageShare: Number(player.damageShare) || 0,
    championPool: player.championPool ? player.championPool.split(',') : []
  }));
  
  // Format matches with references to team objects
  const matches = matchesArray.map(match => {
    const blueTeam = teamsArray.find(team => team.id === match.teamBlueId);
    const redTeam = teamsArray.find(team => team.id === match.teamRedId);
    
    if (!blueTeam || !redTeam) {
      console.warn(`Match ${match.id} references non-existent teams: blue=${match.teamBlueId}, red=${match.teamRedId}`);
      return null;
    }
    
    const matchResult = match.winnerTeamId ? {
      winner: match.winnerTeamId,
      score: [match.scoreBlue || 0, match.scoreRed || 0] as [number, number],
      duration: match.duration || '',
      mvp: match.mvp || '',
      firstBlood: match.firstBlood || '',
      firstDragon: match.firstDragon || '',
      firstBaron: match.firstBaron || ''
    } : undefined;
    
    const gameId = match.id;
    const extraStats = {
      // Extract match team stats for this game
      blueTeamStats: matchStats.get(gameId)?.get(match.teamBlueId) || null,
      redTeamStats: matchStats.get(gameId)?.get(match.teamRedId) || null
    };
    
    return {
      id: match.id,
      tournament: match.tournament,
      date: match.date,
      teamBlue: blueTeam,
      teamRed: redTeam,
      predictedWinner: match.predictedWinner || blueTeam.id, // Default to blue team if no prediction
      blueWinOdds: Number(match.blueWinOdds) || 0.5,
      redWinOdds: Number(match.redWinOdds) || 0.5,
      status: match.status as 'Upcoming' | 'Live' | 'Completed',
      result: matchResult,
      extraStats
    };
  }).filter(match => match !== null) as Match[];
  
  // Convert player match stats from nested maps to an array for database storage
  const playerMatchStatsArray: any[] = [];
  matchPlayerStats.forEach((playerStatsMap, matchId) => {
    playerStatsMap.forEach((stats, playerId) => {
      playerMatchStatsArray.push({
        ...stats,
        match_id: matchId,
        player_id: playerId
      });
    });
  });
  
  console.log(`Processed ${teamsArray.length} teams, ${playersArray.length} players, ${matches.length} matches, and ${playerMatchStatsArray.length} player match statistics`);
  
  return { 
    teams: teamsArray, 
    players: playersArray, 
    matches, 
    playerMatchStats: playerMatchStatsArray 
  };
}
