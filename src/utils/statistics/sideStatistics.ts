
import { SideStatistics } from '../models/types';
import { getMockSideStatistics } from './mockStats';
import { getSideStatistics as fetchSideStats } from '../database/sideStatisticsService';

// Export the getSideStatistics function
export const getSideStatistics = async (teamId: string): Promise<SideStatistics> => {
  try {
    // Fetch real side statistics from the database
    return await fetchSideStats(teamId);
  } catch (error) {
    console.error("Error in statistics module while getting side statistics:", error);
    // Fall back to mock data if there's an error
    return getMockSideStatistics(teamId);
  }
};
