
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

// Cache for loaded data
export let loadedTeams: Team[] | null = null;
export let loadedPlayers: Player[] | null = null;
export let loadedMatches: Match[] | null = null;
export let loadedTournaments: Tournament[] | null = null;

// Function to reset the cache
export const resetCache = () => {
  loadedTeams = null;
  loadedPlayers = null;
  loadedMatches = null;
  loadedTournaments = null;
};
