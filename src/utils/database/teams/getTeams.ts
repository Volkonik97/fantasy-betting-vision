
import { supabase } from "@/integrations/supabase/client";
import { Team } from "../../models/types";
import { toast } from "sonner";
import { getTeamsFromCache, isTeamsCacheValid, setTeamsCache } from "./teamCache";
import { adaptTeamFromDatabase } from "../adapters/teamAdapter";

/**
 * Récupère les équipes depuis la vue 'team_summary_view'.
 * Utilise le cache pour optimiser les performances.
 */
export const getTeams = async (): Promise<Team[]> => {
  try {
    // Vérifier si les données sont en cache
    if (isTeamsCacheValid()) {
      const cachedTeams = getTeamsFromCache();
      if (cachedTeams && cachedTeams.length > 0) {
        return cachedTeams;
      }
    }

    console.log("🧠 [DEBUG] getTeams.ts (version vue) utilisé ✅");

    // Récupérer les données depuis Supabase
    const { data: teamsData, error } = await supabase
      .from("team_summary_view")
      .select("*");

    if (error) {
      console.error("❌ Erreur chargement team_summary_view :", error);
      
      // Tentative de repli sur la table teams si la vue n'existe pas
      console.log("🔄 Tentative de repli sur la table teams...");
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("teams")
        .select("*");
      
      if (fallbackError || !fallbackData) {
        console.error("❌ Erreur chargement fallback teams :", fallbackError);
        toast.error("Erreur lors du chargement des équipes");
        return [];
      }
      
      console.log(`✅ Repli réussi, ${fallbackData.length} équipes chargées depuis la table teams`);
      
      // Convert raw data to Team objects using our adapter and sort them
      const normalizedTeams = fallbackData.map(adaptTeamFromDatabase)
        .sort((a, b) => a.name.localeCompare(b.name));
      
      // Mettre à jour le cache
      setTeamsCache(normalizedTeams);
      return normalizedTeams;
    }

    // Traiter les données et mettre en cache
    if (teamsData) {
      // Convert raw data to Team objects using our adapter and sort them
      const normalizedTeams = teamsData.map(adaptTeamFromDatabase)
        .sort((a, b) => a.name.localeCompare(b.name));
      
      // Mettre à jour le cache
      setTeamsCache(normalizedTeams);
      return normalizedTeams;
    }

    toast.error("Aucune équipe trouvée");
    return [];
  } catch (error) {
    console.error("❌ Erreur globale dans getTeams.ts :", error);
    toast.error("Erreur lors du chargement des équipes");
    return [];
  }
};
