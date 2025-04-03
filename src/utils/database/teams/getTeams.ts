import { supabase } from "@/integrations/supabase/client";
import { Team, Player } from "../../models/types";
import { toast } from "sonner";
import { teams as mockTeams } from "../../models/mockTeams";
import { normalizeRoleName } from "../../leagueData/assembler/modelConverter";

const BUCKET_NAME = "team-logos";

export const getTeams = async (): Promise<Team[]> => {
  try {
    console.log("🔁 Fetching teams and players from Supabase...");

    const { data: teamsData, error: teamsError } = await supabase
      .from("teams")
      .select("*");

    if (teamsError || !teamsData) {
      console.error("❌ Error retrieving teams:", teamsError);
      throw teamsError;
    }

    const { data: allPlayersData, error: playersError } = await supabase
      .from("players")
      .select("*");

    if (playersError || !allPlayersData) {
      console.error("❌ Error retrieving players:", playersError);
      throw playersError;
    }

    console.log(`✅ ${teamsData.length} teams & ${allPlayersData.length} players loaded.`);

    // Group players by team_id
    const playersByTeamId = allPlayersData.reduce((acc, player) => {
      if (!player.team_id) return acc;
      if (!acc[player.team_id]) acc[player.team_id] = [];
      acc[player.team_id].push(player);
      return acc;
    }, {} as Record<string, any[]>);

    // Build enriched teams
    const teams: Team[] = teamsData.map((team) => {
      let logoUrl = team.logo;

      if (logoUrl && !logoUrl.includes(BUCKET_NAME)) {
        const { data: { publicUrl } } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(`${team.id}.png`);
        if (publicUrl) logoUrl = publicUrl;
      }

      const rawPlayers = playersByTeamId[team.id] || [];

      const enrichedPlayers = rawPlayers.map((player) => ({
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

      return {
        id: team.id,
        name: team.name,
        logo: logoUrl,
        region: team.region,
        winRate: Number(team.win_rate) || 0,
        blueWinRate: Number(team.blue_win_rate) || 0,
        redWinRate: Number(team.red_win_rate) || 0,
        averageGameTime: Number(team.average_game_time) || 0,
        players: enrichedPlayers,
      };
    });

    // 🧪 Auto-inject missing players not assigned in team.players[]
    const allTeamPlayerIds = new Set(
      teams.flatMap((team) => team.players?.map((p) => p.id) || [])
    );

    const missingPlayers = allPlayersData.filter(
      (player) => player.team_id && !allTeamPlayerIds.has(player.id)
    );

    if (missingPlayers.length > 0) {
      console.warn("🧩 Injection automatique de joueurs oubliés :", missingPlayers.map(p => p.name));

      for (const ghost of missingPlayers) {
        const team = teams.find((t) => t.id === ghost.team_id);
        if (team) {
          const enrichedGhost = {
            id: ghost.id,
            name: ghost.name,
            role: normalizeRoleName(ghost.role),
            image: ghost.image,
            team: team.id,
            teamName: team.name,
            teamRegion: team.region,
            kda: Number(ghost.kda) || 0,
            csPerMin: Number(ghost.cs_per_min) || 0,
            damageShare: Number(ghost.damage_share) || 0,
            championPool: ghost.champion_pool || [],
          };

          team.players?.push(enrichedGhost);
          console.log(`✅ ${ghost.name} injecté dans ${team.name}`);
        } else {
          console.warn(`⚠️ ${ghost.name} a un team_id inexistant :`, ghost.team_id);
        }
      }
    } else {
      console.log("✅ Aucun joueur fantôme détecté.");
    }

    // Final confirmation
    const kiinCheck = teams.flatMap(t => t.players || []).find(p => p.name?.toLowerCase() === "kiin");
    if (kiinCheck) {
      console.log("🧪 Vérif finale : Kiin est bien présent :", kiinCheck);
    }

    return teams;
  } catch (error) {
    console.error("❌ getTeams global error:", error);
    toast.error("Erreur lors du chargement des équipes");
    return mockTeams;
  }
};
