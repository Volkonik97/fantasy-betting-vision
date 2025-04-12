
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Cache for player stats
let playerStatsCache: Record<string, any> = {};
let cacheTimeStamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in ms

/**
 * Clears the player stats cache
 */
export const clearPlayerStatsCache = (): void => {
  playerStatsCache = {};
  cacheTimeStamp = 0;
};

/**
 * Gets player match statistics for a specific player
 */
export const getPlayerMatchStats = async (playerId: string): Promise<any[]> => {
  try {
    if (!playerId) {
      console.error("No player ID provided");
      return [];
    }
    
    const cacheKey = `player_${playerId}`;
    
    // Check if stats are in cache and not expired
    if (
      playerStatsCache[cacheKey] && 
      Date.now() - cacheTimeStamp < CACHE_DURATION
    ) {
      return playerStatsCache[cacheKey];
    }
    
    // If no cache, get data from the database
    const { data, error } = await supabase
      .from('player_match_stats')
      .select('*')
      .eq('player_id', playerId)
      .order('match_id');
      
    if (error) {
      console.error(`Error fetching stats for player ${playerId}:`, error);
      toast.error("Failed to load player statistics");
      return [];
    }
    
    // Update cache
    playerStatsCache[cacheKey] = data || [];
    cacheTimeStamp = Date.now();
    
    return data || [];
  } catch (error) {
    console.error(`Error in getPlayerMatchStats:`, error);
    toast.error("An error occurred loading player statistics");
    return [];
  }
};

/**
 * Gets player match statistics for a specific player in a specific match
 */
export const getPlayerMatchStatsByPlayerAndMatch = async (
  playerId: string,
  matchId: string
): Promise<any | null> => {
  try {
    if (!playerId || !matchId) {
      console.error("Missing player ID or match ID");
      return null;
    }
    
    const { data, error } = await supabase
      .from('player_match_stats')
      .select('*')
      .eq('player_id', playerId)
      .eq('match_id', matchId)
      .single();
      
    if (error) {
      console.error(`Error fetching stats for player ${playerId} in match ${matchId}:`, error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error(`Error in getPlayerMatchStatsByPlayerAndMatch:`, error);
    return null;
  }
};

/**
 * Gets overall player statistics
 */
export const getPlayerStats = async (playerId: string): Promise<any | null> => {
  try {
    if (!playerId) {
      console.error("No player ID provided");
      return null;
    }
    
    const cacheKey = `player_stats_${playerId}`;
    
    // Check if stats are in cache and not expired
    if (
      playerStatsCache[cacheKey] && 
      Date.now() - cacheTimeStamp < CACHE_DURATION
    ) {
      return playerStatsCache[cacheKey];
    }
    
    // Get player data
    const { data: playerData, error: playerError } = await supabase
      .from('players')
      .select('*')
      .eq('playerid', playerId)
      .single();
      
    if (playerError) {
      console.error(`Error fetching player ${playerId}:`, playerError);
      toast.error("Failed to load player data");
      return null;
    }
    
    // Get match stats
    const matchStats = await getPlayerMatchStats(playerId);
    
    // Calculate aggregate statistics
    const aggregatedStats = calculateAggregateStats(matchStats);
    
    // Combine player data with aggregated stats
    const combinedStats = {
      ...playerData,
      ...aggregatedStats,
      matchCount: matchStats.length
    };
    
    // Update cache
    playerStatsCache[cacheKey] = combinedStats;
    cacheTimeStamp = Date.now();
    
    return combinedStats;
  } catch (error) {
    console.error(`Error in getPlayerStats:`, error);
    toast.error("An error occurred loading player statistics");
    return null;
  }
};

/**
 * Calculate aggregate statistics from match stats
 */
const calculateAggregateStats = (matchStats: any[]): any => {
  if (!matchStats || matchStats.length === 0) {
    return {
      winRate: 0,
      kdaRatio: 0,
      averageKills: 0,
      averageDeaths: 0,
      averageAssists: 0
    };
  }
  
  let wins = 0;
  let totalKills = 0;
  let totalDeaths = 0;
  let totalAssists = 0;
  
  matchStats.forEach(stat => {
    if (stat.is_winner) wins++;
    totalKills += stat.kills || 0;
    totalDeaths += stat.deaths || 0;
    totalAssists += stat.assists || 0;
  });
  
  const matchCount = matchStats.length;
  const winRate = (wins / matchCount) * 100;
  const averageKills = totalKills / matchCount;
  const averageDeaths = totalDeaths / matchCount;
  const averageAssists = totalAssists / matchCount;
  
  // Calculate KDA (avoiding division by zero)
  const kdaRatio = totalDeaths === 0 
    ? totalKills + totalAssists 
    : (totalKills + totalAssists) / totalDeaths;
  
  return {
    winRate,
    kdaRatio,
    averageKills,
    averageDeaths,
    averageAssists
  };
};

/**
 * Gets player timeline statistics
 */
export const getPlayerTimelineStats = async (playerId: string): Promise<any[]> => {
  try {
    if (!playerId) {
      console.error("No player ID provided");
      return [];
    }
    
    const cacheKey = `player_timeline_${playerId}`;
    
    // Check if stats are in cache and not expired
    if (
      playerStatsCache[cacheKey] && 
      Date.now() - cacheTimeStamp < CACHE_DURATION
    ) {
      return playerStatsCache[cacheKey];
    }
    
    // Get match stats
    const matchStats = await getPlayerMatchStats(playerId);
    
    // Get match details for each stat
    const matchDetails = await Promise.all(
      matchStats.map(async (stat) => {
        try {
          const { data: matchData, error: matchError } = await supabase
            .from('matches')
            .select('*')
            .eq('gameid', stat.match_id)
            .maybeSingle();
            
          if (matchError || !matchData) {
            console.warn(`Could not fetch data for match ${stat.match_id}:`, matchError);
            return {
              ...stat,
              date: new Date(),
              is_win: false
            };
          }
          
          // Create a safe date with fallback
          let matchDate = new Date();
          try {
            // Check if matchData exists and has a date property
            if (matchData && typeof matchData === 'object') {
              // Try different date field formats that might exist
              const possibleDateFields = ['date', 'match_date', 'played_at', 'created_at'];
              for (const field of possibleDateFields) {
                if (field in matchData && matchData[field]) {
                  const parsedDate = new Date(matchData[field]);
                  if (!isNaN(parsedDate.getTime())) {
                    matchDate = parsedDate;
                    break;
                  }
                }
              }
            }
          } catch (dateError) {
            console.warn(`Error parsing date for match ${stat.match_id}:`, dateError);
          }
          
          // Determine player's team and if they won
          const playerTeamId = stat.team_id;
          let isWinner = false;
          
          // Safely check if player's team is the winner
          if (matchData && typeof matchData === 'object') {
            const possibleWinnerFields = ['winner_team_id', 'winner_id', 'winning_team_id'];
            for (const field of possibleWinnerFields) {
              if (field in matchData && matchData[field] === playerTeamId) {
                isWinner = true;
                break;
              }
            }
          }
          
          return {
            ...stat,
            date: matchDate,
            is_win: isWinner
          };
        } catch (err) {
          console.error(`Error processing match ${stat.match_id}:`, err);
          return {
            ...stat,
            date: new Date(),
            is_win: false
          };
        }
      })
    );
    
    // Sort by date
    const sortedMatches = matchDetails
      .filter(match => match.date)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Update cache
    playerStatsCache[cacheKey] = sortedMatches;
    cacheTimeStamp = Date.now();
    
    return sortedMatches;
  } catch (error) {
    console.error(`Error in getPlayerTimelineStats:`, error);
    toast.error("An error occurred loading player timeline statistics");
    return [];
  }
};

/**
 * Gets team timeline statistics
 */
export const getTeamTimelineStats = async (teamId: string): Promise<any[]> => {
  try {
    if (!teamId) {
      console.error("No team ID provided");
      return [];
    }
    
    const cacheKey = `team_timeline_${teamId}`;
    
    // Check if stats are in cache and not expired
    if (
      playerStatsCache[cacheKey] && 
      Date.now() - cacheTimeStamp < CACHE_DURATION
    ) {
      return playerStatsCache[cacheKey];
    }
    
    // Get team matches
    const { data: matches, error: matchesError } = await supabase
      .from('matches')
      .select('*')
      .or(`team1_id.eq.${teamId},team2_id.eq.${teamId}`)
      .order('gameid');
      
    if (matchesError) {
      console.error(`Error fetching matches for team ${teamId}:`, matchesError);
      toast.error("Failed to load team matches");
      return [];
    }
    
    if (!matches || matches.length === 0) {
      return [];
    }
    
    // Process matches to extract timeline data
    const timelineData = matches.map(match => {
      // Handle safely - check if match data exists
      if (!match) return null;
      
      // Determine if team is blue side (team1)
      const isTeamBlue = match.team1_id === teamId;
      
      // Determine winner and scores with defaults
      let isWin = false;
      const teamScore = 0;
      const opponentScore = 0;
      
      // Safely check if this team is the winner
      if (match.winner_team_id === teamId) {
        isWin = true;
      }
      
      // Safely create a date object with fallback
      let matchDate = new Date();
      try {
        // Check for various date field formats
        const possibleDateFields = ['date', 'match_date', 'played_at', 'created_at'];
        for (const field of possibleDateFields) {
          if (field in match && match[field]) {
            const parsedDate = new Date(match[field]);
            if (!isNaN(parsedDate.getTime())) {
              matchDate = parsedDate;
              break;
            }
          }
        }
      } catch (dateError) {
        console.warn(`Error parsing date for match ${match.gameid}:`, dateError);
      }
      
      return {
        match_id: match.gameid,
        date: matchDate,
        tournament: match.tournament || 'Unknown',
        patch: match.patch || '',
        opponent_id: isTeamBlue 
          ? (match.team2_id || '') 
          : (match.team1_id || ''),
        opponent_name: isTeamBlue 
          ? (match.team2_name || '') 
          : (match.team1_name || ''),
        score: [teamScore, opponentScore],
        is_win: isWin,
        side: isTeamBlue ? 'blue' : 'red'
      };
    }).filter(Boolean); // Remove any null entries
    
    // Update cache
    playerStatsCache[cacheKey] = timelineData;
    cacheTimeStamp = Date.now();
    
    return timelineData;
  } catch (error) {
    console.error(`Error in getTeamTimelineStats:`, error);
    toast.error("An error occurred loading team timeline statistics");
    return [];
  }
};
