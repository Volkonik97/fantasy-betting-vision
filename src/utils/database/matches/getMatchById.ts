
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
    
    // Execute query without type annotations
    let response;
    try {
      response = await supabase
        .from("matches")
        .select("*")
        .eq("id", matchId)
        .single();
    } catch (e) {
      console.error("Error in query execution:", e);
      throw e;
    }
      
    // Access properties directly from response object
    const matchData = response.data;
    const matchError = response.error;
    
    if (matchError) {
      console.log(`❌ Erreur lors du chargement du match avec ID=${matchId}:`, matchError);
      
      // Essai avec gameid si l'ID direct ne fonctionne pas
      let gameIdResponse;
      try {
        gameIdResponse = await supabase
          .from("matches")
          .select("*")
          .eq("gameid", matchId)
          .single();
      } catch (e) {
        console.error("Error in gameid query execution:", e);
        throw e;
      }
      
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
