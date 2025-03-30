
import { LeagueGameDataRow } from '../csv/types';
import { TeamCSV } from '../csv/types';
import { TeamStatsTracker } from './types';
import { normalizeTimeValue } from '../formatters/timeFormatter';

// Process team statistics from League data rows
export function processTeamData(data: LeagueGameDataRow[]): {
  uniqueTeams: Map<string, TeamCSV>,
  teamStats: Map<string, TeamStatsTracker>
} {
  // Extract unique teams and initialize their stats
  const uniqueTeams = new Map<string, TeamCSV>();
  const teamStats = new Map<string, TeamStatsTracker>();
  
  // First pass: gather all unique teams
  data.forEach(row => {
    if (!row.teamid || !row.teamname) return;
    
    if (!uniqueTeams.has(row.teamid)) {
      uniqueTeams.set(row.teamid, {
        id: row.teamid,
        name: row.teamname,
        logo: '',
        region: row.league || '',
        winRate: '0',
        blueWinRate: '0',
        redWinRate: '0',
        averageGameTime: '0'
      });
      
      teamStats.set(row.teamid, {
        id: row.teamid,
        name: row.teamname,
        logo: '',
        region: row.league || '',
        players: [],
        games: 0,
        wins: 0,
        losses: 0,
        blueWins: 0,
        blueLosses: 0,
        redWins: 0,
        redLosses: 0,
        gameTimes: []
      });
    }
  });
  
  console.log(`Nombre d'équipes uniques identifiées: ${uniqueTeams.size}`);
  
  // Second pass: process game results by team
  const processedGames = new Set<string>();
  
  data.forEach(row => {
    // Skip if no team ID or game ID
    if (!row.teamid || !row.gameid) return;
    
    // Process each game only once per team
    const gameTeamKey = `${row.gameid}-${row.teamid}`;
    if (processedGames.has(gameTeamKey)) return;
    processedGames.add(gameTeamKey);
    
    // Get team stats tracker
    const stats = teamStats.get(row.teamid);
    if (!stats) return;
    
    // Process win/loss
    const isWin = row.result === '1';
    
    if (isWin) {
      stats.wins++;
    } else {
      stats.losses++;
    }
    
    // Process side-specific win/loss
    const side = (row.side || '').toLowerCase();
    if (side === 'blue') {
      if (isWin) {
        stats.blueWins++;
      } else {
        stats.blueLosses++;
      }
    } else if (side === 'red') {
      if (isWin) {
        stats.redWins++;
      } else {
        stats.redLosses++;
      }
    }
    
    // Process game time if available
    if (row.gamelength) {
      // Check if gamelength is in seconds or in MM:SS format
      let gameTimeSeconds = 0;
      
      if (row.gamelength.includes(':')) {
        // Format MM:SS
        const [minutes, seconds] = row.gamelength.split(':').map(Number);
        gameTimeSeconds = (minutes * 60) + seconds;
      } else {
        // Use normalizeTimeValue to handle various formats consistently
        gameTimeSeconds = normalizeTimeValue(row.gamelength);
      }
      
      // If we have a valid game time, add to the array
      if (!isNaN(gameTimeSeconds) && gameTimeSeconds > 0) {
        stats.gameTimes.push(gameTimeSeconds);
      }
    }
  });
  
  // Calculate team statistics
  teamStats.forEach((stats, teamId) => {
    const team = uniqueTeams.get(teamId);
    if (!team) return;
    
    // Calculate win rates
    const totalGames = stats.wins + stats.losses;
    if (totalGames > 0) {
      team.winRate = (stats.wins / totalGames).toFixed(3);
    }
    
    const totalBlueGames = stats.blueWins + stats.blueLosses;
    if (totalBlueGames > 0) {
      team.blueWinRate = (stats.blueWins / totalBlueGames).toFixed(3);
    }
    
    const totalRedGames = stats.redWins + stats.redLosses;
    if (totalRedGames > 0) {
      team.redWinRate = (stats.redWins / totalRedGames).toFixed(3);
    }
    
    // Calculate average game time in minutes
    if (stats.gameTimes.length > 0) {
      const avgGameTimeSeconds = stats.gameTimes.reduce((sum, time) => sum + time, 0) / stats.gameTimes.length;
      // Store as seconds, not minutes (we'll format as MM:SS when displaying)
      team.averageGameTime = avgGameTimeSeconds.toFixed(0);
    }
  });
  
  return { uniqueTeams, teamStats };
}
