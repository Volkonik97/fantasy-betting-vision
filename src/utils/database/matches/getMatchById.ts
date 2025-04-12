
import { supabase } from "@/integrations/supabase/client";
import { Match } from "../../models/types";
import { toast } from "sonner";

/**
 * Récupère un match spécifique par son ID
 */
export const getMatchById = async (matchId: string): Promise<Match | null> => {
  try {
    if (!matchId) {
      console.error("ID de match non fourni");
      return null;
    }

    // Essayer d'abord avec la vue match_detail_view si elle existe
    let { data, error } = await supabase
      .from("matches")
      .select("*")
      .eq("gameid", matchId)
      .single();

    if (error) {
      console.log("❌ Erreur lors du chargement depuis matches, essai avec l'ID direct");
      
      // Essai direct avec l'ID
      const { data: matchData, error: matchError } = await supabase
        .from("matches")
        .select("*")
        .eq("id", matchId)
        .single();
      
      if (matchError) {
        console.error("❌ Toutes les tentatives de récupération du match ont échoué:", 
          { viewError: error, tableError: matchError });
        toast.error("Échec du chargement du match");
        return null;
      }
      
      data = matchData;
    }

    if (!data) {
      console.error(`❌ Aucune donnée pour le match ${matchId}`);
      toast.error("Match non trouvé");
      return null;
    }

    // Normaliser les données selon la structure attendue
    const match: Match = {
      id: data.id || data.gameid,
      tournament: data.tournament,
      date: data.date || new Date().toISOString(),
      teamBlue: {
        id: data.team_blue_id || data.team1_id,
        name: data.team_blue_name || data.team1_name,
        region: data.team_blue_region || "Unknown",
        logo: "",
        winRate: 0,
        blueWinRate: 0,
        redWinRate: 0,
        averageGameTime: 0
      },
      teamRed: {
        id: data.team_red_id || data.team2_id,
        name: data.team_red_name || data.team2_name,
        region: data.team_red_region || "Unknown",
        logo: "",
        winRate: 0,
        blueWinRate: 0,
        redWinRate: 0,
        averageGameTime: 0
      },
      status: data.status || "Completed",
      predictedWinner: data.predicted_winner || "",
      blueWinOdds: data.blue_win_odds || 0.5,
      redWinOdds: data.red_win_odds || 0.5,
      result: {
        winner: data.winner_team_id,
        score: [data.score_blue || 0, data.score_red || 0],
        duration: data.duration || data.gamelength?.toString() || "0",
        mvp: data.mvp || ""
      },
      extraStats: {
        patch: data.patch,
        firstBlood: data.firstblood_team_id,
        firstDragon: data.firstdragon_team_id,
        firstBaron: data.firstbaron_team_id,
        firstTower: data.firsttower_team_id,
        gameNumber: data.game_number
      }
    };
    
    return match;
  } catch (error) {
    console.error("❌ Erreur inattendue dans getMatchById :", error);
    toast.error("Erreur serveur");
    return null;
  }
};
