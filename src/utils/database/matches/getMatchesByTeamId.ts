
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

    // Utiliser la table matches directement avec condition "OU" pour chercher dans les colonnes team1_id et team2_id
    let { data, error } = await supabase
      .from("matches")
      .select("*")
      .or(`team1_id.eq.${teamId},team2_id.eq.${teamId}`);

    // Si cette approche échoue, essayer avec d'autres noms de colonnes possibles
    if (error) {
      console.log("🔄 Premier format de colonne non trouvé, tentative avec un autre format...");
      
      // Essai avec les colonnes team_blue_id/team_red_id
      const { data: matchesData, error: matchesError } = await supabase
        .from("matches")
        .select("*")
        .or(`team_blue_id.eq.${teamId},team_red_id.eq.${teamId}`);
      
      if (matchesError) {
        console.error("❌ Toutes les tentatives de récupération des matchs ont échoué:", 
          { firstError: error, secondError: matchesError });
        toast.error("Erreur lors du chargement des matchs de l'équipe");
        return [];
      }
      
      data = matchesData;
    }

    if (!data || data.length === 0) {
      console.log(`ℹ️ Aucun match trouvé pour l'équipe ${teamId}`);
      return [];
    }

    console.log(`✅ ${data.length} matchs trouvés pour l'équipe ${teamId}`);

    // Récupérer les infos détaillées des équipes pour chaque match
    const matchesWithTeamDetails = await Promise.all(
      data.map(async (match) => {
        // Identifier les IDs des équipes bleue et rouge (en tenant compte des différentes structures possibles)
        const blueTeamId = match.team_blue_id || match.team1_id;
        const redTeamId = match.team_red_id || match.team2_id;
        
        // Récupérer les détails des équipes impliquées
        const teamBlueResponse = await supabase
          .from("teams")
          .select("*")
          .eq("teamid", blueTeamId)
          .single();
          
        const teamRedResponse = await supabase
          .from("teams")
          .select("*")
          .eq("teamid", redTeamId)
          .single();

        // Convertir en format de match attendu par l'application
        return {
          id: match.id || match.gameid,
          tournament: match.tournament || 'Unknown',
          date: match.date || new Date().toISOString(),
          teamBlue: {
            id: blueTeamId,
            name: teamBlueResponse.data?.teamname || match.team1_name || "Équipe Bleue",
            region: teamBlueResponse.data?.region || "Unknown",
            logo: teamBlueResponse.data?.logo || "",
            winRate: teamBlueResponse.data?.winrate || 0,
            blueWinRate: teamBlueResponse.data?.winrate_blue || 0,
            redWinRate: teamBlueResponse.data?.winrate_red || 0,
            averageGameTime: teamBlueResponse.data?.avg_gamelength || 0
          },
          teamRed: {
            id: redTeamId,
            name: teamRedResponse.data?.teamname || match.team2_name || "Équipe Rouge",
            region: teamRedResponse.data?.region || "Unknown",
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
            mvp: match.mvp || ""
          },
          extraStats: {
            patch: match.patch || "",
            year: match.year || null,
            split: match.split || "",
            playoffs: !!match.playoffs,
            team_kpm: match.team_kpm || 0,
            ckpm: match.ckpm || 0,
            team_kills: match.team_kills || 0,
            team_deaths: match.team_deaths || 0,
            dragons: match.dragons || 0,
            heralds: match.heralds || 0,
            barons: match.barons || 0,
            firstBlood: match.first_blood || match.firstblood_team_id || null,
            firstDragon: match.first_dragon || match.firstdragon_team_id || null,
            firstBaron: match.first_baron || match.firstbaron_team_id || null,
            firstTower: match.first_tower || match.firsttower_team_id || null
          }
        } as Match;
      })
    );

    return matchesWithTeamDetails;
  } catch (error) {
    console.error("❌ Erreur inattendue dans getMatchesByTeamId :", error);
    toast.error("Erreur serveur");
    return [];
  }
};
