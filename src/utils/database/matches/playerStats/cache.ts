
import { supabase } from '@/integrations/supabase/client';

// Cache for player stats to improve performance
const playerStatsCache = new Map<string, any[]>();
 
/**
 * Clear the player stats cache
 */
export function clearPlayerStatsCache() {
  playerStatsCache.clear();
  console.log('Player stats cache cleared');
}

/**
 * Get data from cache if available, otherwise fetch from database and cache the result
 */
export async function getWithCache<T>(
  cacheKey: string,
  fetchFn: () => Promise<T[]>
): Promise<T[]> {
  // Check if data exists in cache
  if (playerStatsCache.has(cacheKey)) {
    console.log(`Using cached stats for ${cacheKey}`);
    return playerStatsCache.get(cacheKey) as T[] || [];
  }
  
  // Fetch data
  const data = await fetchFn();
  
  // Cache the results if we have data
  if (data && data.length > 0) {
    playerStatsCache.set(cacheKey, data);
  }
  
  return data;
}

