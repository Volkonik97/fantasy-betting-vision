
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

// Cache pour stocker les données chargées
let loadedTeams: Team[] | null = null;
let loadedPlayers: Player[] | null = null;
let loadedMatches: Match[] | null = null;
let loadedTournaments: Tournament[] | null = null;

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
export const getGSheetCSVUrl = (sheetId: string, sheetName: string): string => {
  return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${sheetName}`;
};

// Fonction pour charger les données depuis Google Sheets
export const loadFromGoogleSheets = async (sheetUrl: string): Promise<{
  teams: Team[];
  players: Player[];
  matches: Match[];
}> => {
  try {
    const sheetId = extractSheetId(sheetUrl);
    
    // Obtenir les URLs CSV pour chaque onglet
    const teamsUrl = getGSheetCSVUrl(sheetId, 'teams');
    const playersUrl = getGSheetCSVUrl(sheetId, 'players');
    const matchesUrl = getGSheetCSVUrl(sheetId, 'matches');
    
    // Charger les données
    const teamsResults = await parseCSVFromURL(teamsUrl);
    const playersResults = await parseCSVFromURL(playersUrl);
    const matchesResults = await parseCSVFromURL(matchesUrl);
    
    // Convertir les données
    const teams = convertTeamData(teamsResults.data as TeamCSV[]);
    const players = convertPlayerData(playersResults.data as PlayerCSV[]);
    const matches = convertMatchData(matchesResults.data as MatchCSV[], teams);
    
    // Associer les joueurs aux équipes
    teams.forEach(team => {
      team.players = players.filter(player => player.team === team.id);
    });
    
    // Mettre en cache les données
    loadedTeams = teams;
    loadedPlayers = players;
    loadedMatches = matches;
    
    return { teams, players, matches };
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
    // Analyser les fichiers CSV
    const teamResults = await parseCSVFile(teamFile);
    const playerResults = await parseCSVFile(playerFile);
    const matchResults = await parseCSVFile(matchFile);
    
    // Convertir les données
    const teams = convertTeamData(teamResults.data as TeamCSV[]);
    const players = convertPlayerData(playerResults.data as PlayerCSV[]);
    const matches = convertMatchData(matchResults.data as MatchCSV[], teams);
    
    // Associer les joueurs aux équipes
    teams.forEach(team => {
      team.players = players.filter(player => player.team === team.id);
    });
    
    // Mettre en cache les données
    loadedTeams = teams;
    loadedPlayers = players;
    loadedMatches = matches;
    
    return { teams, players, matches };
  } catch (error) {
    console.error('Erreur lors du chargement des données CSV:', error);
    throw error;
  }
};

// Modified getter functions to properly handle async imports
export const getTeams = async (): Promise<Team[]> => {
  if (loadedTeams) return loadedTeams;
  const mockData = await import('./mockData');
  return mockData.teams;
};

export const getPlayers = async (): Promise<Player[]> => {
  if (loadedPlayers) return loadedPlayers;
  const mockData = await import('./mockData');
  return mockData.players;
};

export const getMatches = async (): Promise<Match[]> => {
  if (loadedMatches) return loadedMatches;
  const mockData = await import('./mockData');
  return mockData.matches;
};

export const getTournaments = async (): Promise<Tournament[]> => {
  if (loadedTournaments) return loadedTournaments;
  const mockData = await import('./mockData');
  return mockData.tournaments;
};

// Fonction supplémentaire également mise à jour pour gérer les promesses
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
  
  const mockData = await import('./mockData');
  return mockData.getSideStatistics(teamId);
};
