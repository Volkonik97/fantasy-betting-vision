import { supabase } from "@/integrations/supabase/client";
import { Team } from "../../models/types";
import { toast } from "sonner";

/**
 * Récupère une équipe à partir de la vue 'team_summary_view'
 */
export const getTeamById = async (teamId: string): Promise<Team | null> => {
  try {
    if (!teamId) {
      console.error("ID d'équipe non fourni");
      return null;
    }

    const { data, error } = await supabase
      .from("team_summary_view")
      .select("*")
      .eq("id", teamId)
      .single();

    if (error || !data) {
      console.error("❌ Erreur lors du chargement de l'équipe depuis la vue :", error);
      toast.error("Échec du chargement de l'équipe");
      return null;
    }

    return data as Team;
  } catch (error) {
    console.error("❌ Erreur inattendue dans getTeamById :", error);
    toast.error("Erreur serveur");
    return null;
  }
};
