
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
    
    // Try to fetch by ID first without chaining the eq method
    const idResult = await supabase.from("matches").select("*");
    
    // Filter manually after fetching the data
    const idMatch = idResult.data?.find(match => match.gameid === matchId);
      
    if (idResult.error || !idMatch) {
      console.log(`❌ Erreur lors du chargement du match avec ID=${matchId}, tentative avec gameid:`, idResult.error);
      
      // Essai avec gameid si l'ID direct ne fonctionne pas
      const gameIdResult = await supabase.from("matches").select("*");
      const gameIdMatch = gameIdResult.data?.find(match => match.gameid === matchId);
      
      if (gameIdResult.error || !gameIdMatch) {
        console.error("❌ Toutes les tentatives de récupération du match ont échoué:", 
          { idError: idResult.error, gameidError: gameIdResult.error });
        toast.error("Échec du chargement du match");
        return null;
      }
      
      data = gameIdMatch;
    } else {
      data = idMatch;
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
