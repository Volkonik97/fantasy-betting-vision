
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
        console.log(`✅ ${cachedTeams.length} équipes récupérées depuis le cache`);
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
      const normalizedTeams = fallbackData.map(team => {
        // Explicitly format winrate values to ensure they're interpreted correctly
        const processedTeam = {
          ...team,
          winrate: typeof team.winrate === 'number' ? team.winrate : parseFloat(team.winrate || '0'),
          winrate_blue: typeof team.winrate_blue === 'number' ? team.winrate_blue : parseFloat(team.winrate_blue || '0'),
          winrate_red: typeof team.winrate_red === 'number' ? team.winrate_red : parseFloat(team.winrate_red || '0')
        };
        return adaptTeamFromDatabase(processedTeam);
      }).sort((a, b) => a.name.localeCompare(b.name));

      // Log winrates for debugging
      console.log("Winrates after processing:", normalizedTeams.map(t => ({
        name: t.name, 
        winRate: t.winRate, 
        blueWinRate: t.blueWinRate,
        redWinRate: t.redWinRate
      })));
      
      // Mettre à jour le cache
      setTeamsCache(normalizedTeams);
      return normalizedTeams;
    }

    // Traiter les données et mettre en cache
    if (teamsData) {
      // Convert raw data to Team objects using our adapter and sort them
      const normalizedTeams = teamsData.map(team => {
        // Explicitly format winrate values to ensure they're interpreted correctly
        // The view returns different field names for winrates (with _percent suffix)
        const processedTeam = {
          ...team,
          winrate: typeof team.winrate_percent === 'number' ? team.winrate_percent / 100 : parseFloat(String(team.winrate_percent || '0')) / 100,
          winrate_blue: typeof team.winrate_blue_percent === 'number' ? team.winrate_blue_percent / 100 : parseFloat(String(team.winrate_blue_percent || '0')) / 100,
          winrate_red: typeof team.winrate_red_percent === 'number' ? team.winrate_red_percent / 100 : parseFloat(String(team.winrate_red_percent || '0')) / 100
        };
        
        // Log raw values from team summary view
        console.log(`Raw values from team_summary_view for ${team.teamname}:`, {
          winrate_percent: team.winrate_percent,
          winrate_blue_percent: team.winrate_blue_percent,
          winrate_red_percent: team.winrate_red_percent,
        });
        
        return adaptTeamFromDatabase(processedTeam);
      }).sort((a, b) => a.name.localeCompare(b.name));
      
      // Log winrates for debugging
      console.log("Winrates after processing:", normalizedTeams.slice(0, 3).map(t => ({
        name: t.name, 
        winRate: t.winRate, 
        blueWinRate: t.blueWinRate,
        redWinRate: t.redWinRate
      })));
      
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
