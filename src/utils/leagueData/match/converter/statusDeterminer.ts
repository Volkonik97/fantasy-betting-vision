
import { GameTracker } from '../../types';

/**
 * Determine the status of a match (Upcoming, Live, Completed)
 */
export function determineMatchStatus(game: GameTracker): 'Upcoming' | 'Live' | 'Completed' {
  const statusMap: { [key: string]: 'Upcoming' | 'Live' | 'Completed' } = {
    '': 'Upcoming',
    'scheduled': 'Upcoming', 
    'inProgress': 'Live',
    'completed': 'Completed'
  };
  
  // Determine the status of the match based on the result
  if (game.result !== undefined) {
    return 'Completed';
  }
  
  // Default to 'Upcoming' if no status information is available
  return 'Upcoming';
}
