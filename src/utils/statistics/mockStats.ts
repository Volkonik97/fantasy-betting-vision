
import { SideStatistics } from '../models/types';
import { defaultSideStats } from './helpers';
import { teams } from '../models/mockTeams';
import { populateTeamPlayers } from '../models/mockPlayers';

// Fallback to mock data if database fails
export const getMockSideStatistics = (teamId: string): SideStatistics => {
  console.log(`Getting mock side statistics for team ${teamId}`);
  
  // Make sure teams have their players
  const populatedTeams = populateTeamPlayers();
  
  const team = populatedTeams.find(t => t.id === teamId);
  if (!team) {
    // Return default stats if team not found
    console.log(`Team ${teamId} not found in mock data, using default stats`);
    return {
      ...defaultSideStats,
      teamId
    };
  }
  
  // Generate more realistic mock data based on team win rates
  return {
    teamId,
    blueWins: Math.round(team.blueWinRate * 100),
    redWins: Math.round(team.redWinRate * 100),
    blueFirstBlood: 62,
    redFirstBlood: 58,
    blueFirstDragon: 71,
    redFirstDragon: 65,
    blueFirstHerald: 68,
    redFirstHerald: 59,
    blueFirstTower: 65,
    redFirstTower: 62,
    timelineStats: defaultSideStats.timelineStats
  };
};
