
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
    
    // Avoid type instantiation by not chaining methods
    const matchQuery = supabase.from("matches").select("*");
    const matchResponse = await matchQuery.eq("id", matchId).single();
      
    // Access properties directly from response object
    const matchData = matchResponse.data;
    const matchError = matchResponse.error;
    
    if (matchError) {
      console.log(`❌ Erreur lors du chargement du match avec ID=${matchId}:`, matchError);
      
      // Essai avec gameid si l'ID direct ne fonctionne pas
      const gameIdQuery = supabase.from("matches").select("*");
      const gameIdResponse = await gameIdQuery.eq("gameid", matchId).single();
      
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
