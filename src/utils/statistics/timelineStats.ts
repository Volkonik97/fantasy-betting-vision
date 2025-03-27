
import { calculateAverage } from './helpers';

// Calculate timeline stats from player data
export const getTimelineStats = (playerStats: any[]) => {
  // Group stats by time points
  const timePoints = ['10', '15', '20', '25'];
  const result: any = {};
  
  timePoints.forEach(time => {
    const goldKey = `gold_at_${time}`;
    const xpKey = `xp_at_${time}`;
    const csKey = `cs_at_${time}`;
    const goldDiffKey = `gold_diff_at_${time}`;
    const killsKey = `kills_at_${time}`;
    const deathsKey = `deaths_at_${time}`;
    
    // Filter out null values and calculate averages
    const goldValues = playerStats.filter(s => s[goldKey] !== null).map(s => s[goldKey]);
    const xpValues = playerStats.filter(s => s[xpKey] !== null).map(s => s[xpKey]);
    const csValues = playerStats.filter(s => s[csKey] !== null).map(s => s[csKey]);
    const goldDiffValues = playerStats.filter(s => s[goldDiffKey] !== null).map(s => s[goldDiffKey]);
    const killsValues = playerStats.filter(s => s[killsKey] !== null).map(s => s[killsKey]);
    const deathsValues = playerStats.filter(s => s[deathsKey] !== null).map(s => s[deathsKey]);
    
    console.log(`Timeline ${time}min data points:`, {
      gold: goldValues.length,
      xp: xpValues.length,
      cs: csValues.length,
      goldDiff: goldDiffValues.length,
      kills: killsValues.length,
      deaths: deathsValues.length
    });
    
    const avgGold = calculateAverage(goldValues);
    const avgXp = calculateAverage(xpValues);
    const avgCs = calculateAverage(csValues);
    const avgGoldDiff = calculateAverage(goldDiffValues);
    const avgKills = calculateAverage(killsValues, 1);
    const avgDeaths = calculateAverage(deathsValues, 1);
    
    result[time] = {
      avgGold: Math.round(avgGold),
      avgXp: Math.round(avgXp),
      avgCs: Math.round(avgCs),
      avgGoldDiff: Math.round(avgGoldDiff),
      avgKills: Math.round(avgKills * 10) / 10, // One decimal place
      avgDeaths: Math.round(avgDeaths * 10) / 10 // One decimal place
    };
  });
  
  return result;
};

// For backward compatibility, also export the original function name
export const calculateTimelineStats = getTimelineStats;

