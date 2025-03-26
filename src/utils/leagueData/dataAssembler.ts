
import { Team, Player, Match } from '../models/types';
import { LeagueGameDataRow } from '../csvTypes';
import { processTeamData } from './teamProcessor';
import { processPlayerData } from './playerProcessor';
import { processMatchData } from './matchProcessor';
import { convertTeamData, convertPlayerData, convertMatchData } from '../dataConverter';

// Main function to process and assemble data
export const assembleLeagueData = (data: LeagueGameDataRow[]): {
  teams: Team[];
  players: Player[];
  matches: Match[];
} => {
  if (!data || data.length === 0) {
    console.error("Aucune donnée League à traiter");
    return { teams: [], players: [], matches: [] };
  }
  
  console.log(`Traitement de ${data.length} lignes de données League`);
  
  // Process team data
  const { uniqueTeams } = processTeamData(data);
  
  // Process player data
  const { uniquePlayers, playerDamageShares } = processPlayerData(data);
  
  // Process match data
  const { matchStats, matchPlayerStats, matchesArray } = processMatchData(data);
  
  // Convert to application format
  const teams = Array.from(uniqueTeams.values());
  const teamsConverted = convertTeamData(teams);
  
  const players = Array.from(uniquePlayers.values());
  const playersConverted = convertPlayerData(players);
  
  // Assign players to teams
  teamsConverted.forEach(team => {
    team.players = playersConverted.filter(player => player.team === team.id);
  });
  
  // Convert matches
  const matchesConverted = convertMatchData(matchesArray, teamsConverted);
  
  // Add additional match data
  matchesConverted.forEach(match => {
    // Add match-level team stats if available
    const matchTeamStats = matchStats.get(match.id);
    if (matchTeamStats) {
      const blueTeamStats = matchTeamStats.get(match.teamBlue.id);
      const redTeamStats = matchTeamStats.get(match.teamRed.id);
      
      match.extraStats = {
        patch: match.extraStats?.patch || '',
        year: match.extraStats?.year || '',
        split: match.extraStats?.split || '',
        playoffs: match.extraStats?.playoffs || false,
        team_kpm: match.extraStats?.team_kpm || 0,
        ckpm: match.extraStats?.ckpm || 0,
        team_kills: match.extraStats?.team_kills || 0,
        team_deaths: match.extraStats?.team_deaths || 0
      };
      
      if (blueTeamStats) {
        match.extraStats.blueTeamStats = blueTeamStats;
      }
      
      if (redTeamStats) {
        match.extraStats.redTeamStats = redTeamStats;
      }
    }
    
    // Add player match stats if available
    const playerStats = matchPlayerStats.get(match.id);
    if (playerStats) {
      match.playerStats = Array.from(playerStats.values());
    }
  });
  
  return {
    teams: teamsConverted,
    players: playersConverted,
    matches: matchesConverted
  };
};
