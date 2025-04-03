import { supabase } from "@/integrations/supabase/client";
import { Team } from "../../models/types";
import { toast } from "sonner";
import { teams as mockTeams } from "../../models/mockTeams";
import { normalizeRoleName } from "../../leagueData/assembler/modelConverter";

const BUCKET_NAME = "team-logos";

export const getTeams = async (): Promise<Team[]> => {
  try {
    console.log("🧠 [DEBUG] getTeams.ts utilisé ✅");

    const { data: teamsData, error: teamsError } = await supabase
      .from("teams")
      .select("*");

    if (teamsError || !teamsData) {
      console.error("❌ Erreur lors du chargement des équipes :", teamsError);
      throw teamsError;
    }

    // ✅ Chargement de tous les joueurs par batchs de 1000
    let allPlayersData: any[] = [];
    let start = 0;
    const pageSize = 1000;

    while (true) {
      const { data: page, error } = await supabase
        .from("players")
        .select("*")
        .range(start, start + pageSize - 1);

      if (error) {
        console.error("❌ Erreur pagination joueurs Supabase :", error);
        break;
      }

      if (!page || page.length === 0) break;

      allPlayersData = [...allPlayersData, ...page];

      if (page.length < pageSize) break;
      start += pageSize;
    }

    console.log("📊 Nombre total de joueurs récupérés :", allPlayersData.length);

    // Vérif River (facultatif)
    const river = allPlayersData.find(p => p.name?.toLowerCase() === "river");
    if (!river) {
      console.warn("❌ River absent de allPlayersData");
    } else {
      console.log("✅ River présent :", river);
    }

    // Groupement par team_id
    const playersByTeamId = allPlayersData.reduce((acc, player) => {
      const teamId = player.team_id?.trim();
      if (!teamId) return acc;
      if (!acc[teamId]) acc[teamId] = [];
      acc[teamId].push(player);
      return acc;
    }, {} as Record<string, any[]>);

    const teams: Team[] = teamsData.map(team => {
      let logoUrl = team.logo;
      if (logoUrl && !logoUrl.includes(BUCKET_NAME)) {
        const { data: { publicUrl } } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(`${team.id}.png`);
        if (publicUrl) logoUrl = publicUrl;
      }

      const teamPlayers = playersByTeamId[team.id.trim()] || [];

      return {
        id: team.id,
        name: team.name,
        logo: logoUrl,
        region: team.region,
        winRate: Number(team.win_rate) || 0,
        blueWinRate: Number(team.blue_win_rate) || 0,
        redWinRate: Number(team.red_win_rate) || 0,
        averageGameTime: Number(team.average_game_time) || 0,
        players: teamPlayers.map(player => ({
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
        })),
      };
    });

    // ✅ Vérification finale
    console.log("📦 Total des joueurs injectés dans teams[] :", teams.reduce((total, team) => total + (team.players?.length || 0), 0));

    return teams;
  } catch (error) {
    console.error("❌ Erreur globale dans getTeams.ts :", error);
    toast.error("Erreur lors du chargement des équipes");
    return mockTeams;
  }
};
