
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
    
    // Use explicit type annotation to avoid deep type instantiation
    const matchQuery = await supabase
      .from("matches")
      .select("*")
      .eq("id", matchId)
      .single();
    
    if (matchQuery.error) {
      console.log(`❌ Erreur lors du chargement du match avec ID=${matchId}:`, matchQuery.error);
      
      // Essai avec gameid si l'ID direct ne fonctionne pas
      const gameIdQuery = await supabase
        .from("matches")
        .select("*")
        .eq("gameid", matchId)
        .single();
      
      if (gameIdQuery.error) {
        console.error("❌ Toutes les tentatives de récupération du match ont échoué:", 
          { idError: matchQuery.error, gameidError: gameIdQuery.error });
        toast.error("Échec du chargement du match");
        return null;
      }
      
      data = gameIdQuery.data;
    } else {
      data = matchQuery.data;
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
