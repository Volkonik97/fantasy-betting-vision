
import { supabase } from "@/integrations/supabase/client";
import { Team } from "../../models/types";
import { toast } from "sonner";
import { getTeamsFromCache, isTeamsCacheValid, setTeamsCache } from "./teamCache";

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
      const sortedTeams = [...fallbackData].sort((a, b) => a.name.localeCompare(b.name));
      
      // Normaliser les données (la table peut avoir des noms de colonnes différents de la vue)
      const normalizedTeams = sortedTeams.map(team => ({
        id: team.id || team.teamid,
        name: team.name || team.teamname,
        region: team.region,
        logo: team.logo,
        winRate: team.winrate || 0,
        blueWinRate: team.winrate_blue || 0,
        redWinRate: team.winrate_red || 0,
        averageGameTime: team.avg_gamelength || 0
      }));
      
      // Mettre à jour le cache
      setTeamsCache(normalizedTeams);
      return normalizedTeams;
    }

    // Traiter les données et mettre en cache
    if (teamsData) {
      const sortedTeams = [...teamsData].sort((a, b) => a.name.localeCompare(b.name));
      
      // Normaliser les données
      const normalizedTeams = sortedTeams.map(team => ({
        id: team.id || team.teamid,
        name: team.name || team.teamname,
        region: team.region,
        logo: team.logo,
        winRate: team.winrate || team.winrate_percent / 100 || 0,
        blueWinRate: team.winrate_blue || team.winrate_blue_percent / 100 || 0,
        redWinRate: team.winrate_red || team.winrate_red_percent / 100 || 0,
        averageGameTime: team.average_game_time || team.avg_gamelength || 0
      }));
      
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
