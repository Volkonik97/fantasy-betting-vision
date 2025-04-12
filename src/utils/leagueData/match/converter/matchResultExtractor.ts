
import { GameTracker } from '../../types';

/**
 * Extract match result data from game tracker
 */
export function extractMatchResult(game: GameTracker): { 
  winner: string; 
  duration: string; 
  score?: [number, number];
} | null {
  // If game has no result property, return null
  if (!game.result) {
    return null;
  }
  
  return {
    winner: game.result.winner,
    duration: game.result.duration
  };
}

/**
 * Extract match duration from game tracker
 */
export function extractMatchDuration(game: GameTracker): string {
  if (game.result && game.result.duration) {
    return game.result.duration;
  }
  return '0';
}
