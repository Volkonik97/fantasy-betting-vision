import { supabase } from "@/integrations/supabase/client";
import { Team } from "../../models/types";
import { toast } from "sonner";

/**
 * Récupère les équipes depuis la vue 'team_summary_view'.
 */
export const getTeams = async (): Promise<Team[]> => {
  try {
    console.log("🧠 [DEBUG] getTeams.ts (version vue) utilisé ✅");

    const { data: teamsData, error } = await supabase
      .from("team_summary_view")
      .select("*");

    if (error || !teamsData) {
      console.error("❌ Erreur chargement team_summary_view :", error);
      toast.error("Erreur lors du chargement des équipes");
      return [];
    }

    const sortedTeams = [...teamsData].sort((a, b) => a.name.localeCompare(b.name));
    return sortedTeams as Team[];
  } catch (error) {
    console.error("❌ Erreur globale dans getTeams.ts :", error);
    toast.error("Erreur lors du chargement des équipes");
    return [];
  }
};
