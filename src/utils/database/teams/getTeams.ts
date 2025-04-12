
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
      const partialTeams = fallbackData.map(team => adaptTeamFromDatabase(team))
        .sort((a, b) => a.name.localeCompare(b.name));
      
      // Now for each team, get the count of players
      const teamsWithPlayerCounts = await Promise.all(partialTeams.map(async (team) => {
        const { count, error: countError } = await supabase
          .from('players')
          .select('*', { count: 'exact', head: true })
          .eq('teamid', team.id);
          
        if (!countError && count !== null) {
          console.log(`Team ${team.name} has ${count} players`);
          team.players = new Array(count);
        } else {
          console.log(`Could not get player count for team ${team.name}`);
          team.players = [];
        }
          
        return team;
      }));
      
      // Mettre à jour le cache
      setTeamsCache(teamsWithPlayerCounts);
      return teamsWithPlayerCounts;
    }

    // Traiter les données et mettre en cache
    if (teamsData) {
      // Convert raw data to Team objects
      const partialTeams = teamsData.map(team => adaptTeamFromDatabase(team))
        .sort((a, b) => a.name.localeCompare(b.name));
      
      // Now for each team, get the count of players
      const teamsWithPlayerCounts = await Promise.all(partialTeams.map(async (team) => {
        const { count, error: countError } = await supabase
          .from('players')
          .select('*', { count: 'exact', head: true })
          .eq('teamid', team.id);
          
        if (!countError && count !== null) {
          console.log(`Team ${team.name} has ${count} players`);
          team.players = new Array(count);
        } else {
          console.log(`Could not get player count for team ${team.name}`);
          team.players = [];
        }
          
        return team;
      }));
      
      // Mettre à jour le cache
      setTeamsCache(teamsWithPlayerCounts);
      return teamsWithPlayerCounts;
    }

    toast.error("Aucune équipe trouvée");
    return [];
  } catch (error) {
    console.error("❌ Erreur globale dans getTeams.ts :", error);
    toast.error("Erreur lors du chargement des équipes");
    return [];
  }
};
