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
      .select("*")
      .limit(2000); // 🔥 assure-toi que tous les joueurs sont récupérés

    if (playersError || !allPlayersData) {
      console.error("❌ Erreur lors du chargement des joueurs :", playersError);
      throw playersError;
    }

    console.log("📊 [DEBUG] Nombre total de joueurs récupérés :", allPlayersData.length);
    console.log("👥 [DEBUG] Liste brute des joueurs :", allPlayersData.map(p => p.name));

    // 🧪 Vérification ciblée : River
    const river = allPlayersData.find(p => p.name?.toLowerCase() === "river");

    if (!river) {
      console.error("❌ RIVER totalement absent de allPlayersData (DB)");
    } else {
      const riverTeamMatch = teamsData.some(t => t.id.trim() === river.team_id?.trim());
      console.warn("🧪 RIVER trouvé dans DB :", {
        name: river.name,
        id: river.id,
        team_id: river.team_id,
        trimmed: river.team_id?.trim(),
        match: riverTeamMatch
      });
    }

    // 🧩 Regroupement des joueurs par team_id
    const playersByTeamId = allPlayersData.reduce((acc, player) => {
      const teamId = player.team_id?.trim();
      if (!teamId) return acc;
      if (!acc[teamId]) acc[teamId] = [];
      acc[teamId].push(player);
      return acc;
    }, {} as Record<string, any[]>);

    // 📦 Création des équipes avec joueurs
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

    // 🩹 Injection automatique des joueurs absents
    const allTeamPlayerIds = new Set(teams.flatMap(t => t.players || []).map(p => p.id));
    const missingPlayers = allPlayersData.filter(p => p.team_id && !allTeamPlayerIds.has(p.id));
    const injectedLog: { name: string; team: string }[] = [];

    for (const ghost of missingPlayers) {
      let targetTeam = teams.find(t => t.id.trim() === ghost.team_id?.trim());

      if (!targetTeam) {
        targetTeam = teams.find(t => t.id === "__unknown__");
        if (!targetTeam) {
          targetTeam = {
            id: "__unknown__",
            name: "Unknown Team",
            logo: "",
            region: "Unknown",
            winRate: 0,
            blueWinRate: 0,
            redWinRate: 0,
            averageGameTime: 0,
            players: []
          };
          teams.push(targetTeam);
        }
        console.warn(`🧩 Joueur sans team réelle : ${ghost.name} → fallback "Unknown Team"`);
      }

      targetTeam.players?.push({
        id: ghost.id,
        name: ghost.name,
        role: normalizeRoleName(ghost.role),
        image: ghost.image,
        team: targetTeam.id,
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
      console.warn(`✨ ${injectedLog.length} joueur(s) injecté(s) automatiquement :`);
      injectedLog.forEach(p => console.log(`   - ${p.name} → ${p.team}`));
    } else {
      console.log("✅ Aucun joueur fantôme détecté ou à injecter.");
    }

    // 🔍 Dernière vérification
    const stillMissing = allPlayersData.filter(p => {
      return !teams.some(t => t.players?.some(pl => pl.id === p.id));
    });

    if (stillMissing.length > 0) {
      console.warn("⚠️ Certains joueurs sont encore manquants dans teams[].players[] :");
      stillMissing.forEach(p => console.warn(`❌ Manquant : ${p.name} (${p.team_id})`));
    } else {
      console.log("✅ Tous les joueurs DB sont bien présents dans teams[].players.");
    }

    return teams;
  } catch (error) {
    console.error("❌ Erreur globale dans getTeams.ts :", error);
    toast.error("Erreur lors du chargement des équipes");
    return mockTeams;
  }
};
