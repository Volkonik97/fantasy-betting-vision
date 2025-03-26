
import { SideStatistics } from './types';
import { teams } from './mockTeams';
import { populateTeamPlayers } from './mockPlayers';

// Make sure teams have their players
const populatedTeams = populateTeamPlayers();

export const getSideStatistics = (teamId: string): SideStatistics | null => {
  const team = populatedTeams.find(t => t.id === teamId);
  if (!team) return null;
  
  return {
    blueWins: Math.round(team.blueWinRate * 100),
    redWins: Math.round(team.redWinRate * 100),
    blueFirstBlood: 62,
    redFirstBlood: 58,
    blueFirstDragon: 71,
    redFirstDragon: 65,
    blueFirstHerald: 68,
    redFirstHerald: 59,
    blueFirstTower: 65,
    redFirstTower: 62
  };
};
