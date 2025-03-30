
import { LeagueGameDataRow } from '../../csvTypes';

/**
 * Extract picks and bans data from game rows
 */
export function extractPicksAndBans(rows: LeagueGameDataRow[]): {
  picks: any | undefined;
  bans: any | undefined;
} {
  // Extract picks and bans data if present
  const picksData = rows.find(row => 
    row.picks && row.picks.length > 0
  )?.picks;
  
  const bansData = rows.find(row => 
    row.bans && row.bans.length > 0
  )?.bans;
  
  return {
    picks: picksData,
    bans: bansData
  };
}
