
import { GameTracker, MatchTeamStats, PlayerMatchStats } from '../types';
import { LeagueGameDataRow, MatchCSV } from '../../csv/types';

export interface ProcessedGameData {
  uniqueGames: Map<string, GameTracker>;
  matchStats: Map<string, Map<string, MatchTeamStats>>;
  matchPlayerStats: Map<string, Map<string, PlayerMatchStats>>;
  matchesArray: MatchCSV[];
}

export interface GameGroup {
  gameId: string;
  rows: LeagueGameDataRow[];
}
