import { supabase } from "@/integrations/supabase/client";
import { Team, Player } from '../../models/types';
import { toast } from "sonner";
import { teams as mockTeams } from '../../models/mockTeams';
import { normalizeRoleName } from "../../leagueData/assembler/modelConverter";

const BUCKET_NAME = "team-logos";

export const getTeams = async (): Promise<Team[]> => {
  try {
    console.log("Fetching teams from Supabase directly (skipping cache)");

    const { data: teamsData, error: teamsError } = await supabase
      .from('teams')
      .select('*');

    if (teamsError) throw teamsError;
    if (!teamsData || teamsData.length === 0) return mockTeams;

    const { data: allPlayersData, error: playersError } = await supabase
      .from('players')
      .select('*');

    if (playersError) {
      console.error("Error retrieving players:", playersError);
    }

    const teams: Team[] = teamsData.map(team => {
      let logoUrl = team.logo as string;
      if (logoUrl && !logoUrl.includes(BUCKET_NAME)) {
        const { data: { publicUrl } } = supabase.storage.from(BUCKET_NAME).getPublicUrl(`${team.id}.png`);
        if (publicUrl) logoUrl = publicUrl;
      }

      return {
        id: team.id as string,
        name: team.name as string,
        logo: logoUrl,
        region: team.region as string,
        winRate: Number(team.win_rate) || 0,
        blueWinRate: Number(team.blue_win_rate) || 0,
        redWinRate: Number(team.red_win_rate) || 0,
        averageGameTime: Number(team.average_game_time) || 0,
        players: []
      };
    });

    const playersByTeamId = allPlayersData
      ? allPlayersData.reduce((acc, player) => {
          if (!player.team_id) return acc;

          const teamId = player.team_id;
          if (!acc[teamId]) acc[teamId] = [];
          acc[teamId].push(player);
          return acc;
        }, {} as Record<string, any[]>)
      : {};

    teams.forEach(team => {
      const teamPlayers = playersByTeamId[team.id] || [];
      team.players = teamPlayers.map(player => {
        const normalizedRole = normalizeRoleName(player.role) || 'Unknown';
        return {
          id: player.id as string,
          name: player.name as string,
          role: normalizedRole,
          image: player.image as string,
          team: team.id,
          teamName: team.name,
          teamRegion: team.region,
          kda: Number(player.kda) || 0,
          csPerMin: Number(player.cs_per_min) || 0,
          damageShare: Number(player.damage_share) || 0,
          championPool: player.champion_pool as string[] || []
        };
      });
    });
    const genGTeam = teams.find(t => t.name.toLowerCase().includes("gen.g"));
console.warn("🧩 getTeams.ts retourne Gen.G avec :", {
  id: genGTeam?.id,
  playersCount: genGTeam?.players?.length,
  players: genGTeam?.players?.map(p => p.name)
});

    return teams;
  } catch (error) {
    console.error("Error retrieving teams:", error);
    toast.error("Échec du chargement des données d'équipe");
    return mockTeams;
  }
};
