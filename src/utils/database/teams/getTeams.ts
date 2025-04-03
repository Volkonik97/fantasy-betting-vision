import { supabase } from "@/integrations/supabase/client";
import { Team } from "../../models/types";
import { toast } from "sonner";
import { teams as mockTeams } from "../../models/mockTeams";
import { normalizeRoleName } from "../../leagueData/assembler/modelConverter";

const BUCKET_NAME = "team-logos";

export const getTeams = async (): Promise<Team[]> => {
  try {
    console.log("🔁 [getTeams] Récupération des équipes et joueurs depuis Supabase...");

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
    console.log(`✅ ${allPlayersData.length} joueurs chargés`);

    // 🔍 Check si Kiin est là
    const kiinDirect = allPlayersData.find(p => p.name?.toLowerCase() === "kiin");

    if (!kiinDirect) {
      console.warn("🚫 Kiin absent — tentative de récupération via RPC");

      const { data: kiinByQuery, error: kiinQueryError } = await supabase
        .rpc("get_kiin_debug");

      if (kiinQueryError) {
        console.error("❌ Erreur lors du fallback RPC pour Kiin :", kiinQueryError);
      } else if (kiinByQuery?.length > 0) {
        console.warn("🐛 Kiin récupéré via bypass SQL RPC :", kiinByQuery[0]);
        allPlayersData.push(kiinByQuery[0]);
      } else {
        console.warn("❌ Aucun résultat pour Kiin même via fallback");
      }
    }

    // 🧩 Regroupement des joueurs par team_id
    const playersByTeamId = allPlayersData.reduce((acc, player) => {
      if (!player.team_id) return acc;
      if (!acc[player.team_id]) acc[player.team_id] = [];
      acc[player.team_id].push(player);
      return acc;
    }, {} as Record<string, any[]>);

    // 🏗️ Construction des équipes enrichies
    const teams: Team[] = teamsData.map((team) => {
      let logoUrl = team.logo;

      if (logoUrl && !logoUrl.includes(BUCKET_NAME)) {
        const { data: { publicUrl } } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(`${team.id}.png`);
        if (publicUrl) logoUrl = publicUrl;
      }

      const teamPlayers = playersByTeamId[team.id] || [];

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

    // 🛠️ Injection automatique des joueurs fantômes (présents mais non assignés)
    const allTeamPlayerIds = new Set(
      teams.flatMap(t => t.players || []).map(p => p.id)
    );

    const missingPlayers = allPlayersData.filter(
      (p) => p.team_id && !allTeamPlayerIds.has(p.id)
    );

    const injectedLog: { name: string; team: string }[] = [];

    for (const ghost of missingPlayers) {
      const targetTeam = teams.find(t => t.id === ghost.team_id);
      if (!targetTeam) {
        console.warn(`⚠️ ${ghost.name} a un team_id invalide : ${ghost.team_id}`);
        continue;
      }

      targetTeam.players?.push({
        id: ghost.id,
        name: ghost.name,
        role: normalizeRoleName(ghost.role),
        image: ghost.image,
        team: ghost.team_id,
        teamName: targetTeam.name,
        teamRegion: targetTeam.region,
        kda: Number(ghost.kda) || 0,
        csPerMin: Number(ghost.cs_per_min) || 0,
        damageShare: Number(ghost.damage_share) || 0,
        championPool: ghost.champion_pool || [],
      });

      injectedLog.push({ name: ghost.name, team: targetTeam.name });
    }

    if (injectedLog.length > 0) {
      console.warn(`✨ ${injectedLog.length} joueur(s) injectés automatiquement :`);
      injectedLog.forEach(p => console.log(`   - ${p.name} → ${p.team}`));
    } else {
      console.log("✅ Aucun joueur fantôme détecté ou à injecter.");
    }

    // ✅ Check finale pour Kiin
    const kiinCheck = teams.flatMap(t => t.players || []).find(p => p.name?.toLowerCase() === "kiin");
    if (kiinCheck) {
      console.log("🧪 Vérification finale : Kiin est bien présent dans teams :", kiinCheck);
    } else {
      console.error("❌ Kiin toujours absent malgré fallback + auto-injection");
    }

    return teams;
  } catch (error) {
    console.error("❌ Erreur globale dans getTeams :", error);
    toast.error("Erreur lors du chargement des équipes");
    return mockTeams;
  }
};
