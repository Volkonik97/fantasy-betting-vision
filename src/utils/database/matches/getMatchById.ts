
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

    // Essayer d'abord avec la table matches directement
    let { data, error } = await supabase
      .from("matches")
      .select("*")
      .eq("id", matchId)
      .single();

    if (error) {
      console.log(`❌ Erreur lors du chargement du match avec ID=${matchId}:`, error);
      
      // Essai avec gameid si l'ID direct ne fonctionne pas
      const { data: matchData, error: matchError } = await supabase
        .from("matches")
        .select("*")
        .eq("gameid", matchId)
        .single();
      
      if (matchError) {
        console.error("❌ Toutes les tentatives de récupération du match ont échoué:", 
          { idError: error, gameidError: matchError });
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
    // En tenant compte des différents noms de colonnes possibles
    const match: Match = {
      id: data.id || data.gameid,
      tournament: data.tournament,
      date: data.date || new Date().toISOString(),
      teamBlue: {
        id: data.team_blue_id || data.team1_id,
        name: data.team_blue_name || data.team1_name || "Équipe Bleue",
        region: data.team_blue_region || data.team1_region || "Unknown",
        logo: "",
        winRate: 0,
        blueWinRate: 0,
        redWinRate: 0,
        averageGameTime: 0
      },
      teamRed: {
        id: data.team_red_id || data.team2_id,
        name: data.team_red_name || data.team2_name || "Équipe Rouge",
        region: data.team_red_region || data.team2_region || "Unknown",
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
        firstBlood: data.first_blood || data.firstblood_team_id,
        firstDragon: data.first_dragon || data.firstdragon_team_id,
        firstBaron: data.first_baron || data.firstbaron_team_id,
        firstTower: data.first_tower || data.firsttower_team_id,
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
