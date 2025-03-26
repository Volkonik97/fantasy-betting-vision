
import { Team, Player, Match, Tournament } from './mockData';

// Types for CSV data
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

// Interface for League of Legends data
export interface LeagueGameDataRow {
  gameid: string;
  league: string;
  year: string;
  split?: string;
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
  [key: string]: string | undefined;
}

// Create a module-level cache with getter and setter functions
let _loadedTeams: Team[] | null = null;
let _loadedPlayers: Player[] | null = null;
let _loadedMatches: Match[] | null = null;
let _loadedTournaments: Tournament[] | null = null;

// Getter functions
export const getLoadedTeams = (): Team[] | null => _loadedTeams;
export const getLoadedPlayers = (): Player[] | null => _loadedPlayers;
export const getLoadedMatches = (): Match[] | null => _loadedMatches;
export const getLoadedTournaments = (): Tournament[] | null => _loadedTournaments;

// Setter functions
export const setLoadedTeams = (teams: Team[] | null): void => {
  _loadedTeams = teams;
};

export const setLoadedPlayers = (players: Player[] | null): void => {
  _loadedPlayers = players;
};

export const setLoadedMatches = (matches: Match[] | null): void => {
  _loadedMatches = matches;
};

export const setLoadedTournaments = (tournaments: Tournament[] | null): void => {
  _loadedTournaments = tournaments;
};

// Function to reset the cache
export const resetCache = (): void => {
  _loadedTeams = null;
  _loadedPlayers = null;
  _loadedMatches = null;
  _loadedTournaments = null;
};
