
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
    // Get all match IDs at once to batch the request
    const matchIds = matchStats.map(stat => stat.match_id);
    
    // Create a cache for team data to avoid redundant requests
    const teamCache = new Map();
    
    // Fetch all matches in a single query
    const { data: matchesData, error: matchesError } = await supabase
      .from('matches')
      .select('*')
      .in('id', matchIds);
    
    if (matchesError) {
      console.error("Erreur lors de la récupération des matchs:", matchesError);
      toast.error("Erreur lors du chargement des matchs");
      return { enhancedStats: [], errors: { general: matchesError.message } };
    }
    
    // Create a map for faster match lookup
    const matchesMap = new Map();
    matchesData?.forEach(match => {
      matchesMap.set(match.id, match);
    });
    
    // Process all match stats
    const matchErrors: Record<string, string> = {};
    const processPromises = matchStats.map(async (stat) => {
      try {
        const matchData = matchesMap.get(stat.match_id);
        
        if (!matchData) {
          console.warn(`Match ${stat.match_id} non trouvé`);
          return {
            ...stat,
            matchDate: null,
            matchError: "Match non trouvé"
          };
        }
        
        // Determine opponent team
        const isBlueTeam = stat.team_id === matchData.team_blue_id;
        const opponentTeamId = isBlueTeam ? matchData.team_red_id : matchData.team_blue_id;
        
        // Check if opponent team is already in cache
        let opponentTeamName = teamCache.get(opponentTeamId);
        
        if (!opponentTeamName) {
          const { data: opponentTeam, error: opponentError } = await supabase
            .from('teams')
            .select('name')
            .eq('id', opponentTeamId)
            .maybeSingle();
            
          if (!opponentError && opponentTeam) {
            opponentTeamName = opponentTeam.name;
            teamCache.set(opponentTeamId, opponentTeamName);
          } else {
            opponentTeamName = `Équipe ${opponentTeamId}`;
          }
        }
        
        // Format match date
        let formattedDate = null;
        if (matchData.date) {
          try {
            const dateObj = new Date(matchData.date);
            if (!isNaN(dateObj.getTime())) {
              formattedDate = dateObj;
            }
          } catch (dateError) {
            console.warn(`Erreur de parsing de date pour le match ${stat.match_id}:`, dateError);
          }
        }
        
        return {
          ...stat,
          opponentTeamName,
          opponentTeamId,
          matchDate: formattedDate,
          tournament: matchData.tournament || "Tournoi inconnu"
        };
        
      } catch (error) {
        const errorMessage = `Erreur lors du traitement du match ${stat.match_id}: ${error}`;
        matchErrors[stat.match_id] = errorMessage;
        console.error(errorMessage);
        
        return {
          ...stat,
          matchDate: null,
          matchError: `Erreur: ${error}`
        };
      }
    });
    
    // Wait for all stats to be processed
    const processedStats = await Promise.all(processPromises);
    
    // Sort matches by date (newest first)
    const sortedMatches = processedStats.sort((a, b) => {
      // Handle missing dates
      if (!a.matchDate) return 1;
      if (!b.matchDate) return -1;
      
      // Sort newest first
      return b.matchDate.getTime() - a.matchDate.getTime();
    });
    
    return {
      enhancedStats: sortedMatches,
      errors: matchErrors
    };
    
  } catch (error) {
    console.error("Erreur lors du chargement des détails des matchs:", error);
    toast.error("Erreur lors du chargement des détails des matchs");
    return {
      enhancedStats: [],
      errors: { general: `Erreur globale: ${error}` }
    };
  }
};
