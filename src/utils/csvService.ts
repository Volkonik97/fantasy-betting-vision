import Papa, { ParseResult } from 'papaparse';
import { Team, Player, Match, Tournament } from './mockData';

// Types pour les données CSV
export interface TeamCSV {
  id: string;
  name: string;
  logo: string;
  region: string;
  winRate: string;
  blueWinRate: string;
  redWinRate: string;
  averageGameTime: string;
}

export interface PlayerCSV {
  id: string;
  name: string;
  role: string;
  image: string;
  team: string;
  kda: string;
  csPerMin: string;
  damageShare: string;
  championPool: string;
}

export interface MatchCSV {
  id: string;
  tournament: string;
  date: string;
  teamBlueId: string;
  teamRedId: string;
  predictedWinner: string;
  blueWinOdds: string;
  redWinOdds: string;
  status: string;
  winnerTeamId?: string;
  scoreBlue?: string;
  scoreRed?: string;
  duration?: string;
  mvp?: string;
  firstBlood?: string;
  firstDragon?: string;
  firstBaron?: string;
}

// Interface pour les données League of Legends
export interface LeagueGameDataRow {
  gameid: string;
  league: string;
  year: string;
  split: string;
  playoffs: string;
  date: string;
  game: string;
  patch: string;
  participantid: string;
  side: string;
  position: string;
  playername: string;
  playerid: string;
  teamname: string;
  teamid: string;
  champion: string;
  gamelength: string;
  result: string;
  kills: string;
  deaths: string;
  assists: string;
  [key: string]: string;
}

// Constants for localStorage keys
const DB_TEAMS_KEY = 'esports_db_teams';
const DB_PLAYERS_KEY = 'esports_db_players';
const DB_MATCHES_KEY = 'esports_db_matches';
const DB_TOURNAMENTS_KEY = 'esports_db_tournaments';
const DB_LAST_UPDATE_KEY = 'esports_db_last_update';

// Cache pour stocker les données chargées
let loadedTeams: Team[] | null = null;
let loadedPlayers: Player[] | null = null;
let loadedMatches: Match[] | null = null;
let loadedTournaments: Tournament[] | null = null;

// Functions to save data to localStorage
const saveToDatabase = (data: {
  teams: Team[];
  players: Player[];
  matches: Match[];
  tournaments?: Tournament[];
}) => {
  try {
    localStorage.setItem(DB_TEAMS_KEY, JSON.stringify(data.teams));
    localStorage.setItem(DB_PLAYERS_KEY, JSON.stringify(data.players));
    localStorage.setItem(DB_MATCHES_KEY, JSON.stringify(data.matches));
    
    if (data.tournaments) {
      localStorage.setItem(DB_TOURNAMENTS_KEY, JSON.stringify(data.tournaments));
    }
    
    localStorage.setItem(DB_LAST_UPDATE_KEY, new Date().toISOString());
    
    console.log("Données sauvegardées dans la base de données locale");
    return true;
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des données:", error);
    return false;
  }
};

// Function to load data from localStorage
const loadFromDatabase = (): {
  teams: Team[] | null;
  players: Player[] | null;
  matches: Match[] | null;
  tournaments: Tournament[] | null;
  lastUpdate: string | null;
} => {
  try {
    const teamsJson = localStorage.getItem(DB_TEAMS_KEY);
    const playersJson = localStorage.getItem(DB_PLAYERS_KEY);
    const matchesJson = localStorage.getItem(DB_MATCHES_KEY);
    const tournamentsJson = localStorage.getItem(DB_TOURNAMENTS_KEY);
    const lastUpdate = localStorage.getItem(DB_LAST_UPDATE_KEY);
    
    return {
      teams: teamsJson ? JSON.parse(teamsJson) : null,
      players: playersJson ? JSON.parse(playersJson) : null,
      matches: matchesJson ? JSON.parse(matchesJson) : null,
      tournaments: tournamentsJson ? JSON.parse(tournamentsJson) : null,
      lastUpdate
    };
  } catch (error) {
    console.error("Erreur lors du chargement des données:", error);
    return {
      teams: null,
      players: null,
      matches: null,
      tournaments: null,
      lastUpdate: null
    };
  }
};

// Function to check if database has data
export const hasDatabaseData = (): boolean => {
  try {
    return !!localStorage.getItem(DB_TEAMS_KEY);
  } catch (error) {
    return false;
  }
};

// Function to get last database update time
export const getLastDatabaseUpdate = (): string | null => {
  try {
    return localStorage.getItem(DB_LAST_UPDATE_KEY);
  } catch (error) {
    return null;
  }
};

// Fonction pour charger un fichier CSV
export const parseCSVFile = (file: File): Promise<ParseResult<any>> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        resolve(results);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

// Fonction pour charger des données CSV à partir d'une URL
export const parseCSVFromURL = (url: string): Promise<ParseResult<any>> => {
  return new Promise((resolve, reject) => {
    Papa.parse(url, {
      download: true,
      header: true,
      complete: (results) => {
        resolve(results);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

// Convertir des données CSV en objets pour l'application
export const convertTeamData = (teamsCSV: TeamCSV[]): Team[] => {
  return teamsCSV.map(team => ({
    id: team.id,
    name: team.name,
    logo: team.logo,
    region: team.region,
    winRate: parseFloat(team.winRate),
    blueWinRate: parseFloat(team.blueWinRate),
    redWinRate: parseFloat(team.redWinRate),
    averageGameTime: parseFloat(team.averageGameTime),
    players: []
  }));
};

export const convertPlayerData = (playersCSV: PlayerCSV[]): Player[] => {
  return playersCSV.map(player => ({
    id: player.id,
    name: player.name,
    role: player.role as 'Top' | 'Jungle' | 'Mid' | 'ADC' | 'Support',
    image: player.image,
    team: player.team,
    kda: parseFloat(player.kda),
    csPerMin: parseFloat(player.csPerMin),
    damageShare: parseFloat(player.damageShare),
    championPool: player.championPool.split(',').map(champ => champ.trim())
  }));
};

export const convertMatchData = (matchesCSV: MatchCSV[], teams: Team[]): Match[] => {
  return matchesCSV.map(match => {
    const teamBlue = teams.find(t => t.id === match.teamBlueId) || teams[0];
    const teamRed = teams.find(t => t.id === match.teamRedId) || teams[1];
    
    const matchObject: Match = {
      id: match.id,
      tournament: match.tournament,
      date: match.date,
      teamBlue,
      teamRed,
      predictedWinner: match.predictedWinner,
      blueWinOdds: parseFloat(match.blueWinOdds),
      redWinOdds: parseFloat(match.redWinOdds),
      status: match.status as 'Upcoming' | 'Live' | 'Completed'
    };

    if (match.status === 'Completed' && match.winnerTeamId) {
      matchObject.result = {
        winner: match.winnerTeamId,
        score: [parseInt(match.scoreBlue || '0'), parseInt(match.scoreRed || '0')],
        duration: match.duration,
        mvp: match.mvp,
        firstBlood: match.firstBlood,
        firstDragon: match.firstDragon,
        firstBaron: match.firstBaron
      };
    }

    return matchObject;
  });
};

// Fonction pour extraire l'ID de la feuille Google depuis l'URL
export const extractSheetId = (url: string): string => {
  const regex = /\/d\/([a-zA-Z0-9-_]+)/;
  const match = url.match(regex);
  if (match && match[1]) {
    return match[1];
  }
  throw new Error("Format d'URL Google Sheets invalide");
};

// Fonction pour obtenir l'URL CSV exportable d'une feuille Google Sheets
export const getGSheetCSVUrl = (sheetId: string, sheetName: string = ''): string => {
  if (sheetName) {
    return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${sheetName}`;
  }
  return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`;
};

// Fonction pour transformer les données LOL en format attendu par l'application
export const processLeagueData = (data: LeagueGameDataRow[]): {
  teams: Team[];
  players: Player[];
  matches: Match[];
} => {
  const uniqueTeams = new Map<string, TeamCSV>();
  data.forEach(row => {
    if (!uniqueTeams.has(row.teamid)) {
      uniqueTeams.set(row.teamid, {
        id: row.teamid,
        name: row.teamname,
        logo: '',
        region: row.league,
        winRate: '0',
        blueWinRate: '0',
        redWinRate: '0',
        averageGameTime: '0'
      });
    }
  });

  const teamStats = new Map<string, { wins: number, losses: number, blueWins: number, blueLosses: number, redWins: number, redLosses: number, gameTimes: number[] }>();
  data.forEach(row => {
    const teamId = row.teamid;
    if (!teamStats.has(teamId)) {
      teamStats.set(teamId, { wins: 0, losses: 0, blueWins: 0, blueLosses: 0, redWins: 0, redLosses: 0, gameTimes: [] });
    }
    
    const stats = teamStats.get(teamId)!;
    const isWin = row.result === '1';
    const gameLength = parseFloat(row.gamelength);
    
    if (isWin) stats.wins++;
    else stats.losses++;
    
    if (row.side === 'Blue') {
      if (isWin) stats.blueWins++;
      else stats.blueLosses++;
    } else {
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
    if (!uniquePlayers.has(row.playerid)) {
      uniquePlayers.set(row.playerid, {
        id: row.playerid,
        name: row.playername,
        role: row.position,
        image: '',
        team: row.teamid,
        kda: '0',
        csPerMin: '0',
        damageShare: '0',
        championPool: ''
      });
    }
  });

  const playerStats = new Map<string, { kills: number, deaths: number, assists: number, games: number, cs: number, championsPlayed: Set<string> }>();
  data.forEach(row => {
    const playerId = row.playerid;
    if (!playerStats.has(playerId)) {
      playerStats.set(playerId, { kills: 0, deaths: 0, assists: 0, games: 0, cs: 0, championsPlayed: new Set() });
    }
    
    const stats = playerStats.get(playerId)!;
    stats.kills += parseInt(row.kills) || 0;
    stats.deaths += parseInt(row.deaths) || 0;
    stats.assists += parseInt(row.assists) || 0;
    stats.games++;
    
    const minionKills = parseInt(row.minionkills) || 0;
    const monsterKills = parseInt(row.monsterkills) || 0;
    stats.cs += minionKills + monsterKills;
    
    stats.championsPlayed.add(row.champion);
  });

  playerStats.forEach((stats, playerId) => {
    const player = uniquePlayers.get(playerId);
    if (player) {
      const kda = stats.deaths > 0 ? ((stats.kills + stats.assists) / stats.deaths).toFixed(2) : ((stats.kills + stats.assists) * 1).toFixed(2);
      const csPerMin = stats.games > 0 ? (stats.cs / stats.games / 30).toFixed(2) : '0';
      
      player.kda = kda;
      player.csPerMin = csPerMin;
      player.damageShare = '0.25';
      player.championPool = Array.from(stats.championsPlayed).join(',');
    }
  });

  const uniqueMatches = new Map<string, { 
    gameId: string, 
    date: string, 
    teams: { blue: string, red: string },
    result?: string,
    duration?: string
  }>();
  
  data.forEach(row => {
    const gameId = row.gameid;
    if (!uniqueMatches.has(gameId)) {
      uniqueMatches.set(gameId, { 
        gameId,
        date: row.date,
        teams: { 
          blue: '', 
          red: '' 
        }
      });
    }
    
    const match = uniqueMatches.get(gameId)!;
    if (row.side === 'Blue') {
      match.teams.blue = row.teamid;
    } else if (row.side === 'Red') {
      match.teams.red = row.teamid;
    }
    
    match.duration = row.gamelength;
    
    if (row.result === '1') {
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
  
  const matchesArray: MatchCSV[] = Array.from(uniqueMatches.values()).map(match => {
    const tournamentName = `${data[0]?.league || 'Unknown'} ${data[0]?.year || ''} ${data[0]?.split || ''}`;
    
    const matchCSV: MatchCSV = {
      id: match.gameId,
      tournament: tournamentName,
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
  
  const matchesConverted = convertMatchData(matchesArray, teamsConverted);
  
  return {
    teams: teamsConverted,
    players: playersConverted,
    matches: matchesConverted
  };
};

// Fonction pour charger les données depuis Google Sheets (format unique)
export const loadFromSingleGoogleSheet = async (sheetUrl: string): Promise<{
  teams: Team[];
  players: Player[];
  matches: Match[];
}> => {
  try {
    const sheetId = extractSheetId(sheetUrl);
    
    const csvUrl = getGSheetCSVUrl(sheetId);
    
    const results = await parseCSVFromURL(csvUrl);
    
    const data = processLeagueData(results.data as LeagueGameDataRow[]);
    
    loadedTeams = data.teams;
    loadedPlayers = data.players;
    loadedMatches = data.matches;
    
    saveToDatabase(data);
    
    return data;
  } catch (error) {
    console.error('Erreur lors du chargement des données Google Sheets:', error);
    throw error;
  }
};

// Fonction pour charger les données depuis Google Sheets (onglets multiples)
export const loadFromGoogleSheets = async (sheetUrl: string): Promise<{
  teams: Team[];
  players: Player[];
  matches: Match[];
}> => {
  try {
    const sheetId = extractSheetId(sheetUrl);
    
    try {
      return await loadFromSingleGoogleSheet(sheetUrl);
    } catch (error) {
      console.log("Essai du format à onglets multiples...");
      
      const teamsUrl = getGSheetCSVUrl(sheetId, 'teams');
      const playersUrl = getGSheetCSVUrl(sheetId, 'players');
      const matchesUrl = getGSheetCSVUrl(sheetId, 'matches');
      
      const teamsResults = await parseCSVFromURL(teamsUrl);
      const playersResults = await parseCSVFromURL(playersUrl);
      const matchesResults = await parseCSVFromURL(matchesUrl);
      
      const teams = convertTeamData(teamsResults.data as TeamCSV[]);
      const players = convertPlayerData(playersResults.data as PlayerCSV[]);
      const matches = convertMatchData(matchesResults.data as MatchCSV[], teams);
      
      teams.forEach(team => {
        team.players = players.filter(player => player.team === team.id);
      });
      
      loadedTeams = teams;
      loadedPlayers = players;
      loadedMatches = matches;
      
      saveToDatabase({ teams, players, matches });
      
      return { teams, players, matches };
    }
  } catch (error) {
    console.error('Erreur lors du chargement des données Google Sheets:', error);
    throw error;
  }
};

// Fonction principale pour charger les fichiers CSV
export const loadCsvData = async (
  teamFile: File,
  playerFile: File, 
  matchFile: File
): Promise<{
  teams: Team[];
  players: Player[];
  matches: Match[];
}> => {
  try {
    const teamResults = await parseCSVFile(teamFile);
    const playerResults = await parseCSVFile(playerFile);
    const matchResults = await parseCSVFile(matchFile);
    
    const teams = convertTeamData(teamResults.data as TeamCSV[]);
    const players = convertPlayerData(playerResults.data as PlayerCSV[]);
    const matches = convertMatchData(matchResults.data as MatchCSV[], teams);
    
    teams.forEach(team => {
      team.players = players.filter(player => player.team === team.id);
    });
    
    loadedTeams = teams;
    loadedPlayers = players;
    loadedMatches = matches;
    
    saveToDatabase({ teams, players, matches });
    
    return { teams, players, matches };
  } catch (error) {
    console.error('Erreur lors du chargement des données CSV:', error);
    throw error;
  }
};

// Modified getter functions to properly handle async imports
export const getTeams = async (): Promise<Team[]> => {
  if (loadedTeams) return loadedTeams;
  
  const dbData = loadFromDatabase();
  if (dbData.teams) {
    loadedTeams = dbData.teams;
    loadedPlayers = dbData.players;
    loadedMatches = dbData.matches;
    loadedTournaments = dbData.tournaments;
    return dbData.teams;
  }
  
  const { teams } = await import('./mockData');
  return teams;
};

export const getPlayers = async (): Promise<Player[]> => {
  if (loadedPlayers) return loadedPlayers;
  
  const dbData = loadFromDatabase();
  if (dbData.players) {
    loadedTeams = dbData.teams;
    loadedPlayers = dbData.players;
    loadedMatches = dbData.matches;
    loadedTournaments = dbData.tournaments;
    return dbData.players;
  }
  
  const { teams } = await import('./mockData');
  return teams.flatMap(team => team.players);
};

export const getMatches = async (): Promise<Match[]> => {
  if (loadedMatches) return loadedMatches;
  
  const dbData = loadFromDatabase();
  if (dbData.matches) {
    loadedTeams = dbData.teams;
    loadedPlayers = dbData.players;
    loadedMatches = dbData.matches;
    loadedTournaments = dbData.tournaments;
    return dbData.matches;
  }
  
  const { matches } = await import('./mockData');
  return matches;
};

export const getTournaments = async (): Promise<Tournament[]> => {
  if (loadedTournaments) return loadedTournaments;
  
  const dbData = loadFromDatabase();
  if (dbData.tournaments) {
    loadedTeams = dbData.teams;
    loadedPlayers = dbData.players;
    loadedMatches = dbData.matches;
    loadedTournaments = dbData.tournaments;
    return dbData.tournaments;
  }
  
  const { tournaments } = await import('./mockData');
  return tournaments;
};

export const getSideStatistics = async (teamId: string) => {
  if (loadedTeams) {
    const team = loadedTeams.find(t => t.id === teamId);
    if (team) {
      return {
        blueWins: Math.round(team.blueWinRate * 100),
        redWins: Math.round(team.redWinRate * 100),
        blueFirstBlood: 62,
        redFirstBlood: 58,
        blueFirstDragon: 71,
        redFirstDragon: 65,
        blueFirstHerald: 68,
        redFirstHerald: 59,
        blueFirstTower: 65,
        redFirstTower: 62
      };
    }
  }
  
  const dbData = loadFromDatabase();
  if (dbData.teams) {
    const team = dbData.teams.find(t => t.id === teamId);
    if (team) {
      return {
        blueWins: Math.round(team.blueWinRate * 100),
        redWins: Math.round(team.redWinRate * 100),
        blueFirstBlood: 62,
        redFirstBlood: 58,
        blueFirstDragon: 71,
        redFirstDragon: 65,
        blueFirstHerald: 68,
        redFirstHerald: 59,
        blueFirstTower: 65,
        redFirstTower: 62
      };
    }
  }
  
  const { getSideStatistics: getMockSideStatistics } = await import('./mockData');
  return getMockSideStatistics(teamId);
};

export const clearDatabase = (): boolean => {
  try {
    localStorage.removeItem(DB_TEAMS_KEY);
    localStorage.removeItem(DB_PLAYERS_KEY);
    localStorage.removeItem(DB_MATCHES_KEY);
    localStorage.removeItem(DB_TOURNAMENTS_KEY);
    localStorage.removeItem(DB_LAST_UPDATE_KEY);
    
    loadedTeams = null;
    loadedPlayers = null;
    loadedMatches = null;
    loadedTournaments = null;
    
    return true;
  } catch (error) {
    console.error("Erreur lors de la suppression des données:", error);
    return false;
  }
};
