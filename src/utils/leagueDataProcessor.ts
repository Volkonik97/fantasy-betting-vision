
import { LeagueGameDataRow, TeamCSV, PlayerCSV, MatchCSV } from './csvTypes';
import { Team, Player, Match } from './mockData';
import { convertTeamData, convertPlayerData, convertMatchData } from './dataConverter';

// Process League data and convert it to our application format
export const processLeagueData = (data: LeagueGameDataRow[]): {
  teams: Team[];
  players: Player[];
  matches: Match[];
} => {
  // Vérifier si les données sont valides
  if (!data || data.length === 0) {
    console.error("Aucune donnée League à traiter");
    return { teams: [], players: [], matches: [] };
  }
  
  console.log(`Traitement de ${data.length} lignes de données League`);
  
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

  const teamStats = new Map<string, { wins: number, losses: number, blueWins: number, blueLosses: number, redWins: number, redLosses: number, gameTimes: number[] }>();
  data.forEach(row => {
    if (!row.teamid) return;
    
    const teamId = row.teamid;
    if (!teamStats.has(teamId)) {
      teamStats.set(teamId, { wins: 0, losses: 0, blueWins: 0, blueLosses: 0, redWins: 0, redLosses: 0, gameTimes: [] });
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

  const uniquePlayers = new Map<string, PlayerCSV>();
  data.forEach(row => {
    if (row.playerid && !uniquePlayers.has(row.playerid)) {
      uniquePlayers.set(row.playerid, {
        id: row.playerid,
        name: row.playername || row.playerid,
        role: row.position || 'Jungle',
        image: '',
        team: row.teamid || '',
        kda: '0',
        csPerMin: '0',
        damageShare: '0',
        championPool: ''
      });
    }
  });

  console.log(`Nombre de joueurs uniques identifiés: ${uniquePlayers.size}`);

  // Calculate player stats including damage share
  const playerStats = new Map<string, { 
    kills: number, 
    deaths: number, 
    assists: number, 
    games: number, 
    cs: number, 
    totalDamage: number,
    championsPlayed: Set<string> 
  }>();
  
  // First pass to collect player stats
  data.forEach(row => {
    if (!row.playerid) return;
    
    const playerId = row.playerid;
    if (!playerStats.has(playerId)) {
      playerStats.set(playerId, { 
        kills: 0, 
        deaths: 0, 
        assists: 0, 
        games: 0, 
        cs: 0, 
        totalDamage: 0,
        championsPlayed: new Set() 
      });
    }
    
    const stats = playerStats.get(playerId)!;
    stats.kills += parseInt(row.kills || '0') || 0;
    stats.deaths += parseInt(row.deaths || '0') || 0;
    stats.assists += parseInt(row.assists || '0') || 0;
    stats.games++;
    
    const minionKills = parseInt(row.minionkills || '0') || 0;
    const monsterKills = parseInt(row.monsterkills || '0') || 0;
    stats.cs += minionKills + monsterKills;
    
    // Calculate damage
    const damageDone = parseInt(row.damagetochampions || '0') || 0;
    stats.totalDamage += damageDone;
    
    if (row.champion) {
      stats.championsPlayed.add(row.champion);
    }
  });

  // Calculate team total damage for each game separately
  const teamGameDamage = new Map<string, Map<string, number>>();
  
  // First pass to calculate total team damage per game
  data.forEach(row => {
    if (!row.teamid || !row.playerid || !row.gameid) return;
    
    const teamId = row.teamid;
    const gameId = row.gameid;
    const damageDone = parseInt(row.damagetochampions || '0') || 0;
    
    // Create nested map structure if it doesn't exist
    if (!teamGameDamage.has(teamId)) {
      teamGameDamage.set(teamId, new Map<string, number>());
    }
    
    const teamGames = teamGameDamage.get(teamId)!;
    if (!teamGames.has(gameId)) {
      teamGames.set(gameId, 0);
    }
    
    // Add this player's damage to the team's total for this game
    teamGames.set(gameId, teamGames.get(gameId)! + damageDone);
  });
  
  // Calculate player damage share per game and average it
  const playerDamageShares = new Map<string, number[]>();
  
  data.forEach(row => {
    if (!row.teamid || !row.playerid || !row.gameid) return;
    
    const playerId = row.playerid;
    const teamId = row.teamid;
    const gameId = row.gameid;
    const damageDone = parseInt(row.damagetochampions || '0') || 0;
    
    // Get team's total damage for this game
    const teamGameMap = teamGameDamage.get(teamId);
    if (!teamGameMap) return;
    
    const teamGameTotalDamage = teamGameMap.get(gameId) || 0;
    if (teamGameTotalDamage <= 0) return;
    
    // Calculate damage share for this game
    const damageShare = damageDone / teamGameTotalDamage;
    
    // Store the damage share for averaging later
    if (!playerDamageShares.has(playerId)) {
      playerDamageShares.set(playerId, []);
    }
    
    playerDamageShares.get(playerId)!.push(damageShare);
  });
  
  // Update player stats with average damage share
  playerDamageShares.forEach((damageShares, playerId) => {
    const player = uniquePlayers.get(playerId);
    if (player && damageShares.length > 0) {
      const avgDamageShare = damageShares.reduce((sum, share) => sum + share, 0) / damageShares.length;
      player.damageShare = avgDamageShare.toFixed(3);
      console.log(`Player ${player.name} average damage share: ${avgDamageShare}`);
    }
  });

  // Second pass to calculate individual player stats
  playerStats.forEach((stats, playerId) => {
    const player = uniquePlayers.get(playerId);
    if (player) {
      // Calculate KDA
      const kda = stats.deaths > 0 ? ((stats.kills + stats.assists) / stats.deaths) : (stats.kills + stats.assists);
      player.kda = kda.toFixed(2);
      
      // Calculate CS per minute (assuming 30 min average game length if not available)
      const csPerMin = stats.games > 0 ? (stats.cs / stats.games / 30) : 0;
      player.csPerMin = csPerMin.toFixed(2);
      
      // Champion pool
      player.championPool = Array.from(stats.championsPlayed).join(',');
    }
  });

  // Extraire tous les ID de matchs uniques
  const gameIds = new Set<string>();
  data.forEach(row => {
    if (row.gameid) {
      gameIds.add(row.gameid);
    }
  });

  console.log(`Nombre de matchs uniques identifiés: ${gameIds.size}`);

  const uniqueMatches = new Map<string, { 
    gameId: string, 
    date: string, 
    teams: { blue: string, red: string },
    result?: string,
    duration?: string,
    tournament?: string
  }>();
  
  data.forEach(row => {
    if (!row.gameid) return;
    
    const gameId = row.gameid;
    if (!uniqueMatches.has(gameId)) {
      uniqueMatches.set(gameId, { 
        gameId,
        date: row.date || new Date().toISOString(),
        teams: { 
          blue: '', 
          red: '' 
        },
        tournament: `${row.league || 'Unknown'} ${row.year || ''} ${row.split || ''}`
      });
    }
    
    const match = uniqueMatches.get(gameId)!;
    if (row.side && row.side.toLowerCase() === 'blue' && row.teamid) {
      match.teams.blue = row.teamid;
    } else if (row.side && row.side.toLowerCase() === 'red' && row.teamid) {
      match.teams.red = row.teamid;
    }
    
    match.duration = row.gamelength;
    
    if (row.result === '1' && row.teamid) {
      match.result = row.teamid;
    }
  });

  const teams = Array.from(uniqueTeams.values());
  const teamsConverted = convertTeamData(teams);
  
  const players = Array.from(uniquePlayers.values());
  const playersConverted = convertPlayerData(players);
  
  teamsConverted.forEach(team => {
    team.players = playersConverted.filter(player => player.team === team.id);
  });
  
  const matchesArray: MatchCSV[] = Array.from(uniqueMatches.values())
    .filter(match => match.teams.blue && match.teams.red) // S'assurer que les équipes bleue et rouge sont définies
    .map(match => {
      const matchCSV: MatchCSV = {
        id: match.gameId,
        tournament: match.tournament || 'Unknown Tournament',
        date: match.date,
        teamBlueId: match.teams.blue,
        teamRedId: match.teams.red,
        predictedWinner: match.teams.blue,
        blueWinOdds: '0.5',
        redWinOdds: '0.5',
        status: match.result ? 'Completed' : 'Upcoming'
      };
      
      if (match.result) {
        matchCSV.winnerTeamId = match.result;
        matchCSV.duration = match.duration;
      }
      
      return matchCSV;
    });
  
  console.log(`Conversion finale en ${matchesArray.length} matchs`);
  const matchesConverted = convertMatchData(matchesArray, teamsConverted);
  
  return {
    teams: teamsConverted,
    players: playersConverted,
    matches: matchesConverted
  };
};
