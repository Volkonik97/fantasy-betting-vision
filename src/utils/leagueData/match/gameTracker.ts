
import { LeagueGameDataRow } from '../../csv/types';

/**
 * GameTracker interface for tracking unique games
 */
export interface GameTracker {
  id: string;
  date?: string;
  league?: string;
  year?: string;
  split?: string;
  patch?: string;
  playoffs?: boolean;
  teams: {
    blue: string;
    red: string;
  };
  result?: {
    winner: string;
    duration: string;
  };
  rows?: Set<LeagueGameDataRow>;
}

/**
 * Global map for tracking game data
 */
const gameTrackers = new Map<string, GameTracker>();

/**
 * Get or create a game tracker for a specific game ID
 */
export const getOrCreateGame = (gameId: string): GameTracker => {
  if (!gameTrackers.has(gameId)) {
    gameTrackers.set(gameId, {
      id: gameId,
      teams: {
        blue: '',
        red: ''
      }
    });
  }
  return gameTrackers.get(gameId)!;
};

/**
 * Get all tracked games
 */
export const getAllTrackedGames = (): Map<string, GameTracker> => {
  return gameTrackers;
};

/**
 * Clear all tracked games
 */
export const clearTrackedGames = (): void => {
  gameTrackers.clear();
};
