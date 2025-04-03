import { supabase } from "@/integrations/supabase/client";
import { Team, Player } from "../../models/types";
import { toast } from "sonner";
import { teams as mockTeams } from "../../models/mockTeams";
import { normalizeRoleName } from "../../leagueData/assembler/modelConverter";

const BUCKET_NAME = "team-logos";

export const getTeams = async (): Promise<Team[]> => {
  try {
    console.log("🔁 Fetching teams from Supabase...");

    const { data: teamsData, error: teamsError } = await supabase
      .from("teams")
      .select("*");

    if (teamsError) {
      console.error("❌ Error retrieving teams:", teamsError);
      throw teamsError;
    }

    if (!teamsData || teamsData.length === 0) {
      console.warn("⚠️ No teams found, fallback to mock data");
      return mockTeams;
    }

    // 🧠 Requête classique des joueurs
    let { data: allPlayersData, error: playersError } = await supabase
      .from("players")
      .select("*");

    if (playersError) {
      console.error("❌ Error retrieving players:", playersError);
    }

    // 🔍 Check si Kiin est présent dans allPlayersData
    const kiinDirect = allPlayersData?.find(p => p.name?.toLowerCase() === "kiin");

    if (!kiinDirect) {
      console.warn("🚫 Kiin est absent de allPlayersData — tentative de récupération via RPC");

      const { data: kiinByQuery, error: kiinQueryError } = await supabase
        .rpc("get_kiin_debug");

      if (kiinQueryError) {
        console.error("❌ Erreur RPC debug :", kiinQueryError);
      } else if (kiinByQuery && kiinByQuery.length > 0) {
        console.warn("🐛 Kiin récupéré par bypass SQL RPC :", kiinByQuery[0]);
        allPlayersData = [...(allPlayersData || []), kiinByQuery[0]];
      } else {
        console.error("❌ Aucun résultat pour Kiin via RPC non plus !");
      }
    }

    // 🧩 Groupement par team_id
    const playersByTeamId = allPlayersData
      ? allPlayersData.reduce((acc, player) => {
          if (!player.team_id) return acc;
          if (!acc[player.team_id]) acc[player.team_id] = [];
          acc[player.team_id].push(player);
          return acc;
        }, {} as Record<string, any[]>)
      : {};

    const teams: Team[] = teamsData.map((team) => {
      let logoUrl = team.logo;
      if (logoUrl && !logoUrl.includes(BUCKET_NAME)) {
        const { data: { publicUrl } } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(`${team.id}.png`);
        if (publicUrl) logoUrl = publicUrl;
      }

      return {
        id: team.id,
        name: team.name,
        logo: logoUrl,
        region: team.region,
        winRate: Number(team.win_rate) || 0,
        blueWinRate: Number(team.blue_win_rate) || 0,
        redWinRate: Number(team.red_win_rate) || 0,
        averageGameTime: Number(team.average_game_time) || 0,
        players: []
      };
    });

    teams.forEach((team) => {
      const teamPlayers = playersByTeamId[team.id] || [];

      team.players = teamPlayers.map((player) => ({
        id: player.id,
        name: player.name,
        role: normalizeRoleName(player.role),
        image: player.image,
        team: team.id,
        teamName: team.name,
        teamRegion: team.region,
        kda: Number(player.kda) || 0,
        csPerMin: Number(player.cs_per_min) || 0,
        damageShare: Number(player.damage_share) || 0,
        championPool: player.champion_pool || [],
      }));
    });

    // ✅ Confirmation finale
    const kiinCheck = teams
      .flatMap((t) => t.players || [])
      .find((p) => p.name?.toLowerCase() === "kiin");

    if (kiinCheck) {
      console.warn("🧪 Kiin est bien présent dans getTeams final :", kiinCheck);
    } else {
      console.error("❌ Kiin a encore disparu dans getTeams.ts malgré le patch !");
    }

    return teams;
  } catch (error) {
    console.error("❌ getTeams.ts global error:", error);
    toast.error("Échec du chargement des équipes");
    return mockTeams;
  }
};
