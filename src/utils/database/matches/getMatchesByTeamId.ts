
import { supabase } from "@/integrations/supabase/client";
import { Match } from "@/utils/models/types";
import { toast } from "sonner";
import { adaptMatchFromDatabase, RawDatabaseMatch } from "../adapters/matchAdapter";

/**
 * Récupère tous les matchs d'une équipe spécifique avec gestion des différentes structures possibles
 */
export const getMatchesByTeamId = async (teamId: string): Promise<Match[]> => {
  try {
    if (!teamId) {
      console.error("ID d'équipe manquant pour la récupération des matchs");
      return [];
    }

    console.log(`🔍 Récupération des matchs pour l'équipe ${teamId}`);

    // Utiliser la table matches directement avec condition "OU" pour chercher dans les colonnes team1_id et team2_id
    let { data, error } = await supabase
      .from("matches")
      .select("*")
      .or(`team1_id.eq.${teamId},team2_id.eq.${teamId}`);

    // Si cette approche échoue, essayer avec d'autres noms de colonnes possibles
    if (error) {
      console.log("🔄 Premier format de colonne non trouvé, tentative avec un autre format...");
      
      // Essai avec les colonnes team_blue_id/team_red_id
      const { data: matchesData, error: matchesError } = await supabase
        .from("matches")
        .select("*")
        .or(`team_blue_id.eq.${teamId},team_red_id.eq.${teamId}`);
      
      if (matchesError) {
        console.error("❌ Toutes les tentatives de récupération des matchs ont échoué:", 
          { firstError: error, secondError: matchesError });
        toast.error("Erreur lors du chargement des matchs de l'équipe");
        return [];
      }
      
      data = matchesData;
    }

    if (!data || data.length === 0) {
      console.log(`ℹ️ Aucun match trouvé pour l'équipe ${teamId}`);
      return [];
    }

    console.log(`✅ ${data.length} matchs trouvés pour l'équipe ${teamId}`);

    // Récupérer les infos détaillées des équipes pour chaque match
    const matchesWithTeamDetails: Match[] = await Promise.all(
      data.map(async (rawMatch) => {
        // Convert the raw database format to our application model
        const match = adaptMatchFromDatabase(rawMatch as RawDatabaseMatch);
        
        // If needed, fetch additional team details here...
        // For now, return the adapted match
        return match;
      })
    );

    return matchesWithTeamDetails;
  } catch (error) {
    console.error("❌ Erreur inattendue dans getMatchesByTeamId :", error);
    toast.error("Erreur serveur");
    return [];
  }
};
