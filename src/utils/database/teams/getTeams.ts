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

    let { data: allPlayersData, error: playersError } = await supabase
      .from("players")
      .select("*");

    if (playersError || !allPlayersData) {
      console.error("❌ Erreur lors du chargement des joueurs :", playersError);
      throw playersError;
    }

    console.log(`✅ ${teamsData.length} équipes chargées`);
    console.log("👥 [DEBUG] Tous les joueurs (raw):", allPlayersData.map(p => p.name));

    // 🔍 Vérif manuelle Kiin
    const kiin = allPlayersData.find(p => p.name?.toLowerCase() === "kiin");

    if (!kiin) {
      console.warn("🚫 Kiin absent — tentative de récupération via RPC");
      const { data: kiinByQuery, error: kiinQueryError } = await supabase
        .rpc("get_kiin_debug");

      if (kiinQueryError) {
        console.error("❌ Erreur RPC pour Kiin :", kiinQueryError);
      } else if (kiinByQuery?.length > 0) {
        console.warn("🐛 Kiin récupéré via RPC :", kiinByQuery[0]);
        allPlayersData.push(kiinByQuery[0]);
      } else {
        console.warn("❌ Kiin introuvable même via RPC");
      }
    }

    const teamIds = teamsData.map(t => t.id.trim());
    const kiinFinal = allPlayersData.find(p => p.name?.toLowerCase() === "kiin");
    console.log("🔍 [DEBUG] Kiin brut :", kiinFinal);

    if (kiinFinal && kiinFinal.team_id) {
      const match = teamIds.includes(kiinFinal.team_id.trim());
      console.log(`🔁 [CHECK] kiin.team_id = ${kiinFinal.team_id} → match team.id ?`, match);
    }

    // 🧩 Regroupement des joueurs par team_id
    const playersByTeamId = allPlayersData.reduce((acc, player) => {
      const teamId = player.team_id?.trim?.();
      if (!teamId) return acc;
      if (!acc[teamId]) acc[teamId] = [];
      acc[teamId].push(player);
      return acc;
    }, {} as Record<string, any[]>);

    const teams: Team[] = teamsData.map((team) => {
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
        players: teamPlayers.map((player) => ({
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

    // 🛠️ Auto-injection des joueurs manquants
    const allTeamPlayerIds = new Set(
      teams.flatMap(t => t.players || []).map(p => p.id)
    );

    const missingPlayers = allPlayersData.filter(
      (p) => p.team_id && !allTeamPlayerIds.has(p.id)
    );

    const injectedLog: { name: string; team: string }[] = [];

    for (const ghost of missingPlayers) {
      const teamMatch = teams.find(t => t.id.trim() === ghost.team_id?.trim());
      if (!teamMatch) {
        console.warn(`⚠️ ${ghost.name} → team_id introuvable : ${ghost.team_id}`);
        continue;
      }

      teamMatch.players?.push({
        id: ghost.id,
        name: ghost.name,
        role: normalizeRoleName(ghost.role),
        image: ghost.image,
        team: teamMatch.id,
        teamName: teamMatch.name,
        teamRegion: teamMatch.region,
        kda: Number(ghost.kda) || 0,
        csPerMin: Number(ghost.cs_per_min) || 0,
        damageShare: Number(ghost.damage_share) || 0,
        championPool: ghost.champion_pool || [],
      });

      injectedLog.push({ name: ghost.name, team: teamMatch.name });
    }

    if (injectedLog.length > 0) {
      console.warn(`✨ ${injectedLog.length} joueur(s) injectés automatiquement :`);
      injectedLog.forEach(p => console.log(`   - ${p.name} → ${p.team}`));
    } else {
      console.log("✅ Aucun joueur fantôme détecté ou à injecter.");
    }

    return teams;
  } catch (error) {
    console.error("❌ Erreur globale dans getTeams.ts :", error);
    toast.error("Erreur lors du chargement des équipes");
    return mockTeams;
  }
};
