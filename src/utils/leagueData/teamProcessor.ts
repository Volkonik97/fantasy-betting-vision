
import { LeagueGameDataRow, TeamCSV } from '../csvTypes';
import { TeamStatsTracker } from './types';

// Process team data from League data rows
export function processTeamData(data: LeagueGameDataRow[]): {
  uniqueTeams: Map<string, TeamCSV>,
  teamStats: Map<string, TeamStatsTracker>
} {
  // Extract unique teams
  const uniqueTeams = new Map<string, TeamCSV>();
  data.forEach(row => {
    if (row.teamid && !uniqueTeams.has(row.teamid)) {
      uniqueTeams.set(row.teamid, {
        id: row.teamid,
        name: row.teamname || row.teamid,
        logo: '',
        region: row.league || '',
        winRate: '0',
        blueWinRate: '0',
        redWinRate: '0',
        averageGameTime: '0'
      });
    }
  });

  console.log(`Nombre d'équipes uniques identifiées: ${uniqueTeams.size}`);

  // Calculate team statistics
  const teamStats = new Map<string, TeamStatsTracker>();
  data.forEach(row => {
    if (!row.teamid) return;
    
    const teamId = row.teamid;
    if (!teamStats.has(teamId)) {
      teamStats.set(teamId, { 
        wins: 0, 
        losses: 0, 
        blueWins: 0, 
        blueLosses: 0, 
        redWins: 0, 
        redLosses: 0, 
        gameTimes: [] 
      });
    }
    
    const stats = teamStats.get(teamId)!;
    const isWin = row.result === '1';
    const gameLength = parseFloat(row.gamelength || '0');
    
    if (isWin) stats.wins++;
    else stats.losses++;
    
    if (row.side && row.side.toLowerCase() === 'blue') {
      if (isWin) stats.blueWins++;
      else stats.blueLosses++;
    } else if (row.side && row.side.toLowerCase() === 'red') {
      if (isWin) stats.redWins++;
      else stats.redLosses++;
    }
    
    if (!isNaN(gameLength)) {
      stats.gameTimes.push(gameLength);
    }
  });

  // Update team records with calculated statistics
  teamStats.forEach((stats, teamId) => {
    const team = uniqueTeams.get(teamId);
    if (team) {
      const totalGames = stats.wins + stats.losses;
      const blueGames = stats.blueWins + stats.blueLosses;
      const redGames = stats.redWins + stats.redLosses;
      
      team.winRate = totalGames > 0 ? (stats.wins / totalGames).toFixed(2) : '0';
      team.blueWinRate = blueGames > 0 ? (stats.blueWins / blueGames).toFixed(2) : '0';
      team.redWinRate = redGames > 0 ? (stats.redWins / redGames).toFixed(2) : '0';
      
      const avgGameTime = stats.gameTimes.length > 0 
        ? stats.gameTimes.reduce((sum, time) => sum + time, 0) / stats.gameTimes.length
        : 0;
      team.averageGameTime = avgGameTime.toFixed(1);
    }
  });

  return { uniqueTeams, teamStats };
}
