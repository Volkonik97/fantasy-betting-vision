
import { SideStatistics } from '../models/types';
import { getMockSideStatistics } from './mockStats';
import { getSideStatistics as fetchSideStats } from '../database/sideStatisticsService';

// Export the getSideStatistics function
export const getSideStatistics = async (teamId: string): Promise<SideStatistics> => {
  try {
    return await fetchSideStats(teamId);
  } catch (error) {
    console.error("Error in statistics module while getting side statistics:", error);
    return getMockSideStatistics(teamId);
  }
};
