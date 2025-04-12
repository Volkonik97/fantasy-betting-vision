
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
