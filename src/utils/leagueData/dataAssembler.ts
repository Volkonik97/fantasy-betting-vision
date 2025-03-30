
import { LeagueGameDataRow } from '../csvTypes';
import { Match, Player, Team } from '../models/types';
import { processMatchData } from './matchProcessor';
import { processTeamData } from './teamProcessor';
import { processPlayerData } from './playerProcessor';

export function assembleLeagueData(data: LeagueGameDataRow[]): {
  teams: Team[];
  players: Player[];
  matches: Match[];
  playerMatchStats: any[];
} {
  console.log(`Assembling League data from ${data.length} rows...`);
  
  // Process match data to get games, team stats, and player stats
  const { uniqueGames, matchStats, matchPlayerStats, matchesArray } = processMatchData(data);
  
  // Process team statistics
  const teams = processTeamData(uniqueGames, matchStats);
  
  // Process player statistics
  const { players, playerStats } = processPlayerData(matchPlayerStats, matchStats);
  
  // Convert the matchesArray to Match objects
  const matches: Match[] = matchesArray.map(match => {
    const blueTeam = teams.find(t => t.id === match.teamBlueId);
    const redTeam = teams.find(t => t.id === match.teamRedId);
    
    if (!blueTeam || !redTeam) {
      console.warn(`Match ${match.id} is missing a team: blue=${match.teamBlueId}, red=${match.teamRedId}`);
      // Skip this match if teams are missing
      return null;
    }
    
    // Find team stats for this match
    const teamStatsMap = matchStats.get(match.id);
    
    // Create match object
    const matchObject: Match = {
      id: match.id,
      tournament: match.tournament,
      date: match.date,
      teamBlue: blueTeam,
      teamRed: redTeam,
      predictedWinner: match.predictedWinner,
      blueWinOdds: parseFloat(match.blueWinOdds) || 0.5,
      redWinOdds: parseFloat(match.redWinOdds) || 0.5,
      status: match.status as 'Upcoming' | 'Live' | 'Completed',
      
      // Add extra stats from the Oracle's Elixir data
      extraStats: teamStatsMap ? {
        patch: match.patch,
        year: match.year,
        split: match.split,
        playoffs: match.playoffs === 'true',
        team_kpm: 0,
        ckpm: 0,
        first_blood: match.firstBlood,
        first_dragon: match.firstDragon,
        first_herald: match.firstHerald,
        first_baron: match.firstBaron,
        first_tower: match.firstTower,
        dragons: 0,
        barons: 0,
        towers: 0,
        heralds: 0,
        team_kills: 0,
        team_deaths: 0
      } : undefined
    };
    
    // Add result if the match is completed
    if (match.status === 'Completed' && match.winnerTeamId) {
      matchObject.result = {
        winner: match.winnerTeamId,
        score: [parseInt(match.scoreBlue || '0'), parseInt(match.scoreRed || '0')],
        duration: match.duration,
        mvp: match.mvp,
        firstBlood: match.firstBlood, 
        firstDragon: match.firstDragon,
        firstBaron: match.firstBaron,
        firstHerald: match.firstHerald,
        firstTower: match.firstTower
      };
    }
    
    return matchObject;
  }).filter(Boolean) as Match[];
  
  // Return the assembled data
  return {
    teams,
    players,
    matches,
    playerMatchStats: playerStats
  };
}
