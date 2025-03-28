import { SideStatistics } from '../models/types';

// Helper functions for statistics processing

/**
 * Calculate average of values
 */
export function calculateAverage(values: number[], decimals: number = 0): number {
  if (!values || values.length === 0) return 0;
  
  const sum = values.reduce((acc, val) => acc + val, 0);
  const avg = sum / values.length;
  
  // Round to specified number of decimal places
  return Math.round(avg * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

/**
 * Default side statistics
 */
export const defaultSideStats: SideStatistics = {
  teamId: '',
  blueWins: 50,
  redWins: 50,
  blueFirstBlood: 50,
  redFirstBlood: 50,
  blueFirstDragon: 50,
  redFirstDragon: 50,
  blueFirstHerald: 50,
  redFirstHerald: 50,
  blueFirstTower: 50,
  redFirstTower: 50,
  blueFirstBaron: 50,
  redFirstBaron: 50,
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
      avgDeaths: 3,
      avgAssists: 5.7
    }
  }
};

/**
 * Throttle multiple promises to prevent rate limiting
 */
export async function throttlePromises<T>(
  tasks: (() => Promise<T>)[],
  maxConcurrent: number = 5
): Promise<T[]> {
  const results: T[] = [];
  const runningPromises: Promise<void>[] = [];

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    
    const promise = (async () => {
      try {
        const result = await task();
        results[i] = result;
      } catch (error) {
        console.error(`Promise ${i} failed:`, error);
      }
    })();
    
    runningPromises.push(promise);
    
    if (runningPromises.length >= maxConcurrent) {
      await Promise.race(runningPromises);
    }
  }
  
  await Promise.all(runningPromises);
  
  return results;
}
