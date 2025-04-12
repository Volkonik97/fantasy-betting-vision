import { supabase } from "@/integrations/supabase/client";
import { Team } from "../../models/types";
import { toast } from "sonner";
import { getTeamsFromCache, updateTeamInCache } from "./teamCache";
import { adaptTeamFromDatabase } from "../adapters/teamAdapter";

/**
 * Récupère une équipe à partir de la vue 'team_summary_view' ou de la table 'teams'
 * avec gestion du cache et fallback
 */
export const getTeamById = async (teamId: string): Promise<Team | null> => {
  try {
    if (!teamId) {
      console.error("ID d'équipe non fourni");
      return null;
    }
    
    // Essayer de récupérer depuis le cache d'abord
    const cachedTeams = getTeamsFromCache();
    if (cachedTeams) {
      const cachedTeam = cachedTeams.find(team => team.id === teamId);
      if (cachedTeam) {
        console.log(`🧠 Équipe ${teamId} récupérée depuis le cache`);
        return cachedTeam;
      }
    }

    // Essayer d'abord avec la vue team_summary_view
    let { data, error } = await supabase
      .from("team_summary_view")
      .select("*")
      .eq("id", teamId)
      .single();

    // Si la vue n'existe pas ou a un problème, essayer avec la table teams
    if (error) {
      console.log("❌ Erreur lors du chargement depuis la vue, tentative avec la table teams");
      
      // Essai avec teamid (au cas où le nom de colonne est différent)
      const { data: teamData, error: teamError } = await supabase
        .from("teams")
        .select("*")
        .eq("id", teamId)
        .single();
      
      if (teamError) {
        // Essai avec une autre colonne potentielle
        const { data: fallbackData, error: fallbackError } = await supabase
          .from("teams")
          .select("*")
          .eq("teamid", teamId)
          .single();
          
        if (fallbackError) {
          console.error("❌ Toutes les tentatives de récupération de l'équipe ont échoué:", 
            { viewError: error, tableError: teamError, fallbackError });
          toast.error("Échec du chargement de l'équipe");
          return null;
        }
        
        data = fallbackData;
      } else {
        data = teamData;
      }
    }

    if (!data) {
      console.error(`❌ Aucune donnée pour l'équipe ${teamId}`);
      toast.error("Équipe non trouvée");
      return null;
    }

    // Use the adapter to convert to Team object
    const team = adaptTeamFromDatabase(data as any);
    
    // Mettre à jour l'équipe dans le cache
    updateTeamInCache(team);
    
    return team;
  } catch (error) {
    console.error("❌ Erreur inattendue dans getTeamById :", error);
    toast.error("Erreur serveur");
    return null;
  }
};
