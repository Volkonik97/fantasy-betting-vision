
import { GameTracker } from '../../types';

/**
 * Extract match result data
 */
export function extractMatchResultData(game: GameTracker): {
  winnerTeamId: string;
  scoreBlue: string;
  scoreRed: string;
  duration?: string;
  mvp?: string;
} {
  let winnerTeamId = game.result || '';
  let scoreBlue = '0';
  let scoreRed = '0';
  
  // Set the scores based on the winner
  if (winnerTeamId === game.teams.blue) {
    scoreBlue = '1';
    scoreRed = '0';
  } else if (winnerTeamId === game.teams.red) {
    scoreBlue = '0';
    scoreRed = '1';
  }
  
  return {
    winnerTeamId,
    scoreBlue,
    scoreRed,
    duration: game.duration
  };
}
