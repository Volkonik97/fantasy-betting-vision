
import { GameTracker, MatchTeamStats } from '../types';
import { MatchCSV } from '../../csvTypes';

/**
 * Convert game tracker to match CSV object
 */
export function convertToMatchCsv(
  match: GameTracker, 
  matchStats: Map<string, Map<string, MatchTeamStats>>
): MatchCSV {
  // Find first objective holders for this match
  const teamStatsMap = matchStats.get(match.id);
  let firstBlood = '';
  let firstDragon = '';
  let firstHerald = '';
  let firstBaron = '';
  let firstTower = '';
  
  if (teamStatsMap) {
    teamStatsMap.forEach(teamStats => {
      // Check if this team got any first objectives
      if (teamStats.first_blood === teamStats.team_id) {
        firstBlood = teamStats.team_id;
      }
      if (teamStats.first_dragon === teamStats.team_id) {
        firstDragon = teamStats.team_id;
      }
      if (teamStats.first_herald === teamStats.team_id) {
        firstHerald = teamStats.team_id;
      }
      if (teamStats.first_baron === teamStats.team_id) {
        firstBaron = teamStats.team_id;
      }
      if (teamStats.first_tower === teamStats.team_id) {
        firstTower = teamStats.team_id;
      }
    });
  }
  
  const matchCsv: MatchCSV = {
    id: match.id,
    tournament: match.league,
    date: match.date,
    teamBlueId: match.teams.blue,
    teamRedId: match.teams.red,
    predictedWinner: match.teams.blue, // Default to blue team
    blueWinOdds: '0.5',
    redWinOdds: '0.5',
    status: match.result ? 'Completed' : 'Upcoming',
    firstBlood: firstBlood,
    firstDragon: firstDragon,
    firstHerald: firstHerald,
    firstBaron: firstBaron,
    firstTower: firstTower,
    patch: match.patch,
    year: match.year,
    split: match.split,
    playoffs: match.playoffs ? 'true' : 'false'
  };
  
  if (match.result) {
    matchCsv.winnerTeamId = match.result;
    
    // Set scores
    if (match.result === match.teams.blue) {
      matchCsv.scoreBlue = '1';
      matchCsv.scoreRed = '0';
    } else if (match.result === match.teams.red) {
      matchCsv.scoreBlue = '0';
      matchCsv.scoreRed = '1';
    }
    
    // Set duration
    if (match.duration) {
      matchCsv.duration = match.duration;
    }
  }
  
  return matchCsv;
}
