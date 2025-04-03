import { supabase } from "@/integrations/supabase/client";
import { Team, Player } from '../../models/types';
import { toast } from "sonner";
import { teams as mockTeams } from '../../models/mockTeams';
import { normalizeRoleName } from "../../leagueData/assembler/modelConverter";

const BUCKET_NAME = "team-logos";

export const getTeams = async (): Promise<Team[]> => {
  try {
    console.log("🔁 Fetching teams from Supabase...");

    const { data: teamsData, error: teamsError } = await supabase
      .from('teams')
      .select('*');

    if (teamsError) {
      console.error("❌ Error retrieving teams:", teamsError);
      throw teamsError;
    }

    if (!teamsData || teamsData.length === 0) {
      console.warn("⚠️ No teams found, fallback to mock data");
      return mockTeams;
    }

    const { data: allPlayersData, error: playersError } = await supabase
      .from('players')
      .select('*');

    if (playersError) {
      console.error("❌ Error retrieving players:", playersError);
    }

    const playersByTeamId = allPlayersData
      ? allPlayersData.reduce((acc, player) => {
          if (!player.team_id) return acc;
          if (!acc[player.team_id]) acc[player.team_id] = [];
          acc[player.team_id].push(player);
          return acc;
        }, {} as Record<string, any[]>)
      : {};

    const teams: Team[] = teamsData.map(team => {
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

    teams.forEach(team => {
      const teamPlayers = playersByTeamId[team.id] || [];

      team.players = teamPlayers.map(player => ({
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
        championPool: player.champion_pool || []
      }));
    });

    const genGTeam = teams.find(t => t.name.toLowerCase().includes("gen.g"));
    console.warn("📤 getTeams.ts retourne Gen.G avec :", {
      id: genGTeam?.id,
      playersCount: genGTeam?.players?.length,
      players: genGTeam?.players?.map(p => p.name)
    });

    return teams;
  } catch (error) {
    console.error("❌ getTeams.ts global error:", error);
    toast.error("Échec du chargement des équipes");
    return mockTeams;
  }
};
