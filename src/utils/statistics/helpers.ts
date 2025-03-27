
/**
 * Calculate average from an array of numbers with optional decimal places
 */
export const calculateAverage = (values: number[], decimalPlaces = 0): number => {
  if (!values || values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  const avg = sum / values.length;
  
  if (decimalPlaces > 0) {
    const multiplier = Math.pow(10, decimalPlaces);
    return Math.round(avg * multiplier) / multiplier;
  }
  
  return avg;
};

/**
 * Calculate percentage from value and total
 */
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

/**
 * Limit the number of requests to avoid overwhelming the database
 */
export const throttlePromises = async <T>(
  promiseFunctions: (() => Promise<T>)[],
  batchSize: number = 5
): Promise<T[]> => {
  const results: T[] = [];
  
  for (let i = 0; i < promiseFunctions.length; i += batchSize) {
    const batch = promiseFunctions.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(fn => fn()));
    results.push(...batchResults);
  }
  
  return results;
};

// Default side statistics object for initialization
export const defaultSideStats = {
  blueWins: 0,
  blueLosses: 0,
  redWins: 0,
  redLosses: 0,
  blueFirstBloods: 0,
  redFirstBloods: 0,
  blueFirstTowers: 0,
  redFirstTowers: 0,
  blueFirstDragons: 0,
  redFirstDragons: 0,
  blueFirstBarons: 0,
  redFirstBarons: 0,
  blueFirstHeralds: 0,
  redFirstHeralds: 0,
  blueFirstInhibs: 0,
  redFirstInhibs: 0,
  totalMatches: 0
};
