
import { TeamCSV } from '../csv/types';
import { Team } from '../models/types';

/**
 * Convert team CSV data to application Team objects
 */
export const convertTeamData = (teamsCSV: TeamCSV[]): Team[] => {
  return teamsCSV.map(team => ({
    id: team.id,
    name: team.name,
    logo: team.logo,
    region: team.region,
    winRate: parseFloat(team.winRate) || 0,
    blueWinRate: parseFloat(team.blueWinRate) || 0,
    redWinRate: parseFloat(team.redWinRate) || 0,
    averageGameTime: parseFloat(team.averageGameTime) || 0,
    players: []
  }));
};
