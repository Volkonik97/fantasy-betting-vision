
import { SideStatistics } from '../models/types';

// Helper function to calculate percentage with error handling
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

// Helper function to calculate average with optional decimal places
export const calculateAverage = (values: number[], decimalPlaces = 0): number => {
  if (!values || values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  const avg = sum / values.length;
  
  if (decimalPlaces > 0) {
    const multiplier = Math.pow(10, decimalPlaces);
    return Math.round(avg * multiplier) / multiplier;
  }
  
  return Math.round(avg);
};

// Default side statistics if data is not available
export const defaultSideStats: SideStatistics = {
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
  timelineStats: {
    '10': {
      avgGold: 3250,
      avgXp: 4120,
      avgCs: 85,
      avgGoldDiff: 350,
      avgKills: 1.2,
      avgDeaths: 0.8
    },
    '15': {
      avgGold: 5120,
      avgXp: 6780,
      avgCs: 130,
      avgGoldDiff: 580,
      avgKills: 2.5,
      avgDeaths: 1.3
    },
    '20': {
      avgGold: 7350,
      avgXp: 9450,
      avgCs: 175,
      avgGoldDiff: 850,
      avgKills: 3.8,
      avgDeaths: 2.1
    },
    '25': {
      avgGold: 9780,
      avgXp: 12400,
      avgCs: 220,
      avgGoldDiff: 1250,
      avgKills: 5.2,
      avgDeaths: 3.0
    }
  }
};
