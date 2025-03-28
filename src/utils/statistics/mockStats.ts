
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
    blueFirstBaron: 55,
    redFirstBaron: 52,
    timelineStats: {
      '10': {
        avgGold: 3250,
        avgXp: 4120,
        avgCs: 85,
        avgGoldDiff: 350,
        avgCsDiff: 5,
        avgKills: 1.2,
        avgDeaths: 0.8,
        avgAssists: 1.5
      },
      '15': {
        avgGold: 5120,
        avgXp: 6780,
        avgCs: 130,
        avgGoldDiff: 580,
        avgCsDiff: 8,
        avgKills: 2.5,
        avgDeaths: 1.3,
        avgAssists: 2.8
      },
      '20': {
        avgGold: 7350,
        avgXp: 9450,
        avgCs: 175,
        avgGoldDiff: 850,
        avgCsDiff: 12,
        avgKills: 3.8,
        avgDeaths: 2.1,
        avgAssists: 4.2
      },
      '25': {
        avgGold: 9780,
        avgXp: 12400,
        avgCs: 220,
        avgGoldDiff: 1250,
        avgCsDiff: 15,
        avgKills: 5.2,
        avgDeaths: 3.0,
        avgAssists: 5.7
      }
    }
  };
};
