import { supabase } from "@/integrations/supabase/client";
import { Match } from "@/utils/models/types";
import { toast } from "sonner";

/**
 * Récupère tous les matchs d'une équipe spécifique depuis la vue 'match_summary_view'.
 */
export const getMatchesByTeamId = async (teamId: string): Promise<Match[]> => {
  try {
    if (!teamId) {
      console.error("ID d'équipe manquant pour la récupération des matchs");
      return [];
    }

    const { data, error } = await supabase
      .from("match_summary_view")
      .select("*")
      .or(`team_blue_id.eq.${teamId},team_red_id.eq.${teamId}`);

    if (error || !data) {
      console.error("❌ Erreur lors de la récupération des matchs par équipe :", error);
      toast.error("Erreur lors du chargement des matchs de l'équipe");
      return [];
    }

    return data as Match[];
  } catch (error) {
    console.error("❌ Erreur inattendue dans getMatchesByTeamId :", error);
    toast.error("Erreur serveur");
    return [];
  }
};
