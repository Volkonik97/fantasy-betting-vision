
import { Team, Player, Match, Tournament } from '../../models/types';

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
