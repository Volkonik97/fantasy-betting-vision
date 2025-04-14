
import { supabase } from "@/integrations/supabase/client";
import { Match } from "../../models/types";
import { toast } from "sonner";
import { adaptMatchFromDatabase, RawDatabaseMatch } from "../adapters/matchAdapter";

/**
 * Récupère un match spécifique par son ID
 */
export const getMatchById = async (matchId: string): Promise<Match | null> => {
  try {
    if (!matchId) {
      console.error("ID de match non fourni");
      return null;
    }

    // Essayer d'abord avec la table matches directement
    let data = null;
    
    // Create the query without chaining to avoid type instantiation issues
    const matchesTable = supabase.from("matches");
    const matchQuery = matchesTable.select("*");
    // Apply the filter as a separate step
    const filteredMatchQuery = matchQuery.eq("id", matchId);
    // Execute the query
    const matchResponse = await filteredMatchQuery.single();
      
    // Access properties directly from response object
    const matchData = matchResponse.data;
    const matchError = matchResponse.error;
    
    if (matchError) {
      console.log(`❌ Erreur lors du chargement du match avec ID=${matchId}:`, matchError);
      
      // Essai avec gameid si l'ID direct ne fonctionne pas
      // Use same step-by-step approach
      const matchesTableFallback = supabase.from("matches");
      const gameIdQuery = matchesTableFallback.select("*");
      const filteredGameIdQuery = gameIdQuery.eq("gameid", matchId);
      const gameIdResponse = await filteredGameIdQuery.single();
      
      // Access properties directly from response object
      const gameIdData = gameIdResponse.data;
      const gameIdError = gameIdResponse.error;
      
      if (gameIdError) {
        console.error("❌ Toutes les tentatives de récupération du match ont échoué:", 
          { idError: matchError, gameidError: gameIdError });
        toast.error("Échec du chargement du match");
        return null;
      }
      
      data = gameIdData;
    } else {
      data = matchData;
    }

    if (!data) {
      console.error(`❌ Aucune donnée pour le match ${matchId}`);
      toast.error("Match non trouvé");
      return null;
    }

    // Use the adapter to convert database format to our application model
    const match = adaptMatchFromDatabase(data as RawDatabaseMatch);
    return match;
  } catch (error) {
    console.error("❌ Erreur inattendue dans getMatchById :", error);
    toast.error("Erreur serveur");
    return null;
  }
};
