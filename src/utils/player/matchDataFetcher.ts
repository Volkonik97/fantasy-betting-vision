
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Fetches and enhances match stats for a player by adding match details
 * @param matchStats Raw match stats from the database
 * @param isWinForPlayer Function to determine if a match was a win for the player
 */
export const fetchEnhancedMatchStats = async (
  matchStats: any[],
  isWinForPlayer: (stat: any) => boolean
): Promise<{
  enhancedStats: any[],
  errors: Record<string, string>
}> => {
  if (matchStats.length === 0) {
    return { enhancedStats: [], errors: {} };
  }
  
  console.log(`Chargement des détails pour ${matchStats.length} matchs...`);
  
  try {
    // Get all match IDs to fetch
    const matchIds = matchStats.map(stat => stat.match_id);
    console.log("IDs des matchs à récupérer:", matchIds);
    
    // Fetch all matches in a single request with error handling
    let matchesData: any[] = [];
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .in('gameid', matchIds);
        
      if (error) {
        console.error("Error fetching matches:", error);
        toast.error("Error loading matches");
      } else {
        matchesData = data || [];
      }
    } catch (fetchError) {
      console.error("Exception fetching matches:", fetchError);
    }
    
    console.log(`${matchesData.length} matches found out of ${matchIds.length} requested`);
    
    // Create a Map for faster access to match data
    const matchesMap = new Map();
    matchesData.forEach(match => {
      if (match && match.gameid) {
        matchesMap.set(match.gameid, match);
      }
    });
    
    // Process each player statistic
    const matchesWithDetails = [];
    const errorsByMatchId: Record<string, string> = {};
    
    for (const stat of matchStats) {
      try {
        // Get match data from the Map
        const matchData = matchesMap.get(stat.match_id);
        
        if (!matchData) {
          console.warn(`Match ${stat.match_id} not found`);
          errorsByMatchId[stat.match_id] = "Match not found in database response";
          
          matchesWithDetails.push({
            ...stat,
            matchDate: null,
            matchError: "Match not found"
          });
          continue;
        }
        
        // Determine opponent team based on player's team
        const playerTeamId = stat.team_id;
        const isBlueTeam = playerTeamId === matchData.team1_id;
        const opponentTeamId = isBlueTeam ? matchData.team2_id : matchData.team1_id;
        
        // Get opponent team info if IDs exist
        let opponentTeamName = `Team ${opponentTeamId || 'Unknown'}`;
        if (opponentTeamId) {
          try {
            const { data: teamData } = await supabase
              .from('teams')
              .select('teamname')
              .eq('teamid', opponentTeamId)
              .maybeSingle();
              
            if (teamData && teamData.teamname) {
              opponentTeamName = teamData.teamname;
            }
          } catch (teamError) {
            console.warn(`Could not fetch team name for ${opponentTeamId}:`, teamError);
          }
        }
        
        // Format date safely
        let formattedDate = null;
        if (matchData.date) {
          try {
            const dateObj = new Date(matchData.date);
            if (!isNaN(dateObj.getTime())) {
              formattedDate = dateObj;
            } else {
              console.warn(`Invalid date format for match ${stat.match_id}: ${matchData.date}`);
              errorsByMatchId[stat.match_id] = `Invalid date format: ${matchData.date}`;
            }
          } catch (dateError) {
            console.warn(`Date parsing error for match ${stat.match_id}:`, dateError);
            errorsByMatchId[stat.match_id] = "Date conversion error";
          }
        } else {
          console.warn(`Missing date for match ${stat.match_id}`);
          errorsByMatchId[stat.match_id] = "Date missing in match data";
        }
        
        // Add information to the stat
        matchesWithDetails.push({
          ...stat,
          opponentTeamName: opponentTeamName,
          opponentTeamId: opponentTeamId,
          matchDate: formattedDate,
          tournament: matchData.tournament || "Unknown tournament"
        });
        
      } catch (error) {
        console.error(`Error processing match ${stat.match_id}:`, error);
        errorsByMatchId[stat.match_id] = `Processing error: ${error}`;
        matchesWithDetails.push({
          ...stat,
          matchDate: null,
          matchError: `Processing error: ${error}`
        });
      }
    }
    
    // Sort matches by date (newest to oldest)
    const sortedMatches = matchesWithDetails.sort((a, b) => {
      // If a date is missing, place it at the end
      if (!a.matchDate) return 1;
      if (!b.matchDate) return -1;
      
      // Sort from newest to oldest
      return b.matchDate.getTime() - a.matchDate.getTime();
    });
    
    return {
      enhancedStats: sortedMatches,
      errors: errorsByMatchId
    };
  } catch (error) {
    console.error("Error loading match details:", error);
    toast.error("Error loading match details");
    return {
      enhancedStats: [],
      errors: { general: `Global error: ${error}` }
    };
  }
};
