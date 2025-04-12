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
    // Récupérer directement tous les matchs en une seule requête
    const matchIds = matchStats.map(stat => stat.match_id);
    console.log("IDs des matchs à récupérer:", matchIds);
    
    const { data: matchesData, error: matchesError } = await supabase
      .from('matches')
      .select('*')
      .in('id', matchIds);
    
    if (matchesError) {
      console.error("Erreur lors de la récupération des matchs:", matchesError);
      toast.error("Erreur lors du chargement des matchs");
      return { enhancedStats: [], errors: { general: matchesError.message } };
    }
    
    console.log(`${matchesData?.length || 0} matchs trouvés sur ${matchIds.length} demandés`);
    
    // Créer un Map pour un accès plus rapide aux données des matchs
    const matchesMap = new Map();
    matchesData?.forEach(match => {
      matchesMap.set(match.gameid, match);
    });
    
    // Traitement de chaque statistique de joueur
    const matchesWithDetails = [];
    const errorsByMatchId: Record<string, string> = {};
    
    for (const stat of matchStats) {
      try {
        // Récupérer les données du match depuis le Map
        const matchData = matchesMap.get(stat.match_id);
        
        if (!matchData) {
          console.warn(`Match ${stat.match_id} non trouvé parmi les ${matchesData?.length || 0} matchs récupérés`);
          errorsByMatchId[stat.match_id] = "Match non trouvé dans la réponse de la base de données";
          
          // Vérifier si le match existe vraiment dans la base de données
          const { data: singleMatch, error: singleMatchError } = await supabase
            .from('matches')
            .select('*')
            .eq('id', stat.match_id)
            .maybeSingle();
            
          if (singleMatchError) {
            console.error(`Erreur lors de la vérification du match ${stat.match_id}:`, singleMatchError);
          } else if (singleMatch) {
            console.log(`Le match ${stat.match_id} existe dans la base de données mais n'a pas été récupéré correctement:`, singleMatch);
            errorsByMatchId[stat.match_id] = "Match existe mais n'a pas été récupéré correctement";
          }
          
          matchesWithDetails.push({
            ...stat,
            matchDate: null,
            matchError: "Match non trouvé"
          });
          continue;
        }
        
        // Déterminer l'équipe adverse
        const isBlueTeam = stat.team_id === matchData.team_blue_id;
        const opponentTeamId = isBlueTeam ? matchData.team_red_id : matchData.team_blue_id;
        
        // Récupérer le nom de l'équipe adverse
        const { data: opponentTeam, error: opponentError } = await supabase
          .from('teams')
          .select('name')
          .eq('id', opponentTeamId)
          .maybeSingle();
          
        if (opponentError) {
          console.error(`Erreur lors de la récupération de l'équipe adverse (${opponentTeamId}):`, opponentError);
          errorsByMatchId[stat.match_id] = `Équipe adverse non trouvée: ${opponentError.message}`;
        }
        
        // Formater la date si elle existe
        let formattedDate = null;
        if (matchData.date) {
          try {
            const dateObj = new Date(matchData.date);
            if (!isNaN(dateObj.getTime())) {
              formattedDate = dateObj;
            } else {
              console.warn(`Format de date invalide pour le match ${stat.match_id}: ${matchData.date}`);
              errorsByMatchId[stat.match_id] = `Format de date invalide: ${matchData.date}`;
            }
          } catch (dateError) {
            console.warn(`Erreur de parsing de date pour le match ${stat.match_id}:`, dateError);
            errorsByMatchId[stat.match_id] = "Erreur de conversion de date";
          }
        } else {
          console.warn(`Date manquante pour le match ${stat.match_id}`);
          errorsByMatchId[stat.match_id] = "Date manquante dans les données du match";
        }
        
        // Ajouter les informations au stat
        const opponentTeamName = opponentTeam?.name || `Équipe ${opponentTeamId}`;
        matchesWithDetails.push({
          ...stat,
          opponentTeamName: opponentTeamName,
          opponentTeamId: opponentTeamId,
          matchDate: formattedDate,
          tournament: matchData.tournament || "Tournoi inconnu"
        });
        
      } catch (error) {
        console.error(`Erreur lors du traitement du match ${stat.match_id}:`, error);
        errorsByMatchId[stat.match_id] = `Erreur lors du traitement: ${error}`;
        matchesWithDetails.push({
          ...stat,
          matchDate: null,
          matchError: `Erreur lors du traitement: ${error}`
        });
      }
    }
    
    // Trier les matchs par date (du plus récent au plus ancien)
    const sortedMatches = matchesWithDetails.sort((a, b) => {
      // Si une date est manquante, la placer à la fin
      if (!a.matchDate) return 1;
      if (!b.matchDate) return -1;
      
      // Trier du plus récent au plus ancien
      return b.matchDate.getTime() - a.matchDate.getTime();
    });
    
    return {
      enhancedStats: sortedMatches,
      errors: errorsByMatchId
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
