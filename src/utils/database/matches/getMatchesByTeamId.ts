
import { supabase } from "@/integrations/supabase/client";
import { Match } from "@/utils/models/types";
import { toast } from "sonner";

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

    // Première tentative: Utiliser la vue match_summary_view
    let { data, error } = await supabase
      .from("match_summary_view")
      .select("*")
      .or(`team_blue_id.eq.${teamId},team_red_id.eq.${teamId}`);

    // Si la vue n'existe pas, essayer directement avec la table matches
    if (error) {
      console.log("🔄 Vue match_summary_view non trouvée, tentative avec la table matches...");
      
      // Essai avec les colonnes team_blue_id/team_red_id
      const { data: matchesData, error: matchesError } = await supabase
        .from("matches")
        .select("*")
        .or(`team_blue_id.eq.${teamId},team_red_id.eq.${teamId}`);
      
      if (matchesError) {
        // Essai avec d'autres noms de colonnes possibles
        console.log("🔄 Tentative avec des noms de colonnes alternatifs...");
        const { data: fallbackData, error: fallbackError } = await supabase
          .from("matches")
          .select("*")
          .or(`team1_id.eq.${teamId},team2_id.eq.${teamId}`);
          
        if (fallbackError) {
          console.error("❌ Toutes les tentatives de récupération des matchs ont échoué:", 
            { viewError: error, matchesError, fallbackError });
          toast.error("Erreur lors du chargement des matchs de l'équipe");
          return [];
        }
        
        data = fallbackData;
      } else {
        data = matchesData;
      }
    }

    if (!data || data.length === 0) {
      console.log(`ℹ️ Aucun match trouvé pour l'équipe ${teamId}`);
      return [];
    }

    console.log(`✅ ${data.length} matchs trouvés pour l'équipe ${teamId}`);

    // Récupérer les infos détaillées des équipes pour chaque match
    const matchesWithTeamDetails = await Promise.all(
      data.map(async (match) => {
        // Identifier les IDs des équipes bleue et rouge
        const blueTeamId = match.team_blue_id || match.team1_id;
        const redTeamId = match.team_red_id || match.team2_id;
        
        // Récupérer les détails des équipes impliquées
        const teamBlueResponse = await supabase
          .from("teams")
          .select("*")
          .eq("id", blueTeamId)
          .single();
          
        const teamRedResponse = await supabase
          .from("teams")
          .select("*")
          .eq("id", redTeamId)
          .single();

        // Convertir en format de match attendu par l'application
        return {
          id: match.id || match.gameid,
          tournament: match.tournament,
          date: match.date,
          teamBlue: {
            id: blueTeamId,
            name: teamBlueResponse.data?.name || teamBlueResponse.data?.teamname || match.team1_name || "Équipe Bleue",
            region: teamBlueResponse.data?.region || "",
            logo: teamBlueResponse.data?.logo || "",
            winRate: teamBlueResponse.data?.winrate || 0,
            blueWinRate: teamBlueResponse.data?.winrate_blue || 0,
            redWinRate: teamBlueResponse.data?.winrate_red || 0,
            averageGameTime: teamBlueResponse.data?.avg_gamelength || 0
          },
          teamRed: {
            id: redTeamId,
            name: teamRedResponse.data?.name || teamRedResponse.data?.teamname || match.team2_name || "Équipe Rouge",
            region: teamRedResponse.data?.region || "",
            logo: teamRedResponse.data?.logo || "",
            winRate: teamRedResponse.data?.winrate || 0,
            blueWinRate: teamRedResponse.data?.winrate_blue || 0,
            redWinRate: teamRedResponse.data?.winrate_red || 0,
            averageGameTime: teamRedResponse.data?.avg_gamelength || 0
          },
          predictedWinner: match.predicted_winner || "",
          blueWinOdds: match.blue_win_odds || 0.5,
          redWinOdds: match.red_win_odds || 0.5,
          status: match.status || "Completed",
          result: {
            winner: match.winner_team_id,
            score: [match.score_blue || 0, match.score_red || 0],
            duration: match.duration || match.gamelength?.toString() || "",
            mvp: match.mvp || "",
            firstBlood: match.first_blood || match.firstblood_team_id,
            firstDragon: match.first_dragon || match.firstdragon_team_id,
            firstBaron: match.first_baron || match.firstbaron_team_id,
            firstHerald: match.first_herald || match.firstherald_team_id,
            firstTower: match.first_tower || match.firsttower_team_id
          },
          extraStats: {
            patch: match.patch,
            year: match.year,
            split: match.split,
            playoffs: match.playoffs || false,
            team_kpm: match.team_kpm,
            ckpm: match.ckpm,
            team_kills: match.team_kills,
            team_deaths: match.team_deaths,
            dragons: match.dragons,
            heralds: match.heralds,
            barons: match.barons,
            firstBlood: match.first_blood || match.firstblood_team_id,
            firstDragon: match.first_dragon || match.firstdragon_team_id,
            firstBaron: match.first_baron || match.firstbaron_team_id
          }
        };
      })
    );

    return matchesWithTeamDetails;
  } catch (error) {
    console.error("❌ Erreur inattendue dans getMatchesByTeamId :", error);
    toast.error("Erreur serveur");
    return [];
  }
};
