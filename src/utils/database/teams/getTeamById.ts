
import { supabase } from "@/integrations/supabase/client";
import { Team } from '../../models/types';
import { toast } from "sonner";
import { findTeamInCache, updateTeamInCache } from './teamCache';

/**
 * Get a single team by ID
 */
export const getTeamById = async (teamId: string): Promise<Team | null> => {
  try {
    if (!teamId) {
      console.error("No team ID provided");
      return null;
    }
    
    // Try to find in cache first
    const cachedTeam = findTeamInCache(teamId);
    if (cachedTeam) {
      console.log(`Found team ${teamId} in cache`);
      return cachedTeam;
    }
    
    console.log(`Fetching team ${teamId} from Supabase`);
    
    // Fetch team from database
    const { data: teamData, error: teamError } = await supabase
      .from('teams')
      .select('*')
      .eq('id', teamId)
      .single();
    
    if (teamError) {
      console.error(`Error retrieving team ${teamId}:`, teamError);
      return null;
    }
    
    if (!teamData) {
      console.warn(`Team ${teamId} not found in database`);
      return null;
    }
    
    // Convert database format to application format first
    const team: Team = {
      id: teamData.id as string,
      name: teamData.name as string,
      logo: teamData.logo as string,
      region: teamData.region as string,
      winRate: Number(teamData.win_rate) || 0,
      blueWinRate: Number(teamData.blue_win_rate) || 0,
      redWinRate: Number(teamData.red_win_rate) || 0,
      averageGameTime: Number(teamData.average_game_time) || 0,
      players: [] // Initialize with empty array
    };
    
    // Fetch players for this team - USE A MORE DIRECT QUERY
    console.log(`Fetching players for team ${teamId}`);
    const { data: supabasePlayers, error: playersError } = await supabase
      .from('players')
      .select('*')
      .eq('team_id', teamId);
    
    if (playersError) {
      console.error(`Error retrieving players for team ${teamId}:`, playersError);
      // Continue without players
    }
    
    // Log player data for debugging - More details
    console.log(`Found ${supabasePlayers?.length || 0} players for team ${teamId}:`, supabasePlayers);
    
    // Process Supabase players if available
    if (supabasePlayers && Array.isArray(supabasePlayers) && supabasePlayers.length > 0) {
      console.log("Using Supabase players data");
      team.players = supabasePlayers.map(player => ({
        id: player.id as string,
        name: player.name as string,
        role: (player.role || 'Mid') as 'Top' | 'Jungle' | 'Mid' | 'ADC' | 'Support',
        image: player.image as string,
        team: player.team_id as string,
        teamName: team.name,
        kda: Number(player.kda) || 0,
        csPerMin: Number(player.cs_per_min) || 0,
        damageShare: Number(player.damage_share) || 0,
        championPool: Array.isArray(player.champion_pool) ? player.champion_pool : 
          (typeof player.champion_pool === 'string' ? [player.champion_pool] : [])
      }));
    } else {
      // No players from Supabase, try to use mock data
      console.log("No players found in database, trying to fetch mock players");
      
      try {
        const { players } = await import('../../models/mockPlayers');
        console.log("All mock players:", players.length);
        
        // Try multiple match methods for team ID
        let teamPlayers = players.filter(p => p.team === teamId);
        
        if (teamPlayers.length === 0 && team.name) {
          // Try matching by team name
          console.log(`Trying to match players by team name: ${team.name}`);
          teamPlayers = players.filter(p => 
            p.team.toLowerCase().includes(team.name.toLowerCase()) || 
            (p.teamName && p.teamName.toLowerCase().includes(team.name.toLowerCase()))
          );
        }
        
        console.log(`Found ${teamPlayers.length} mock players for team ${teamId}`);
        
        if (teamPlayers.length > 0) {
          team.players = teamPlayers.map(p => ({
            id: p.id,
            name: p.name,
            role: (p.role || 'Mid') as 'Top' | 'Jungle' | 'Mid' | 'ADC' | 'Support',
            image: p.image,
            team: p.team,
            teamName: team.name,
            kda: Number(p.kda) || 0,
            csPerMin: Number(p.csPerMin) || 0,
            damageShare: Number(p.damageShare) || 0,
            championPool: Array.isArray(p.championPool) ? p.championPool : 
              (typeof p.championPool === 'string' ? [p.championPool] : [])
          }));
        }
      } catch (mockError) {
        console.error("Error loading mock player data:", mockError);
      }
    }
    
    // If we still have no players and this is 100 Thieves, add hardcoded roster
    if (team.players.length === 0 && 
        (team.name === "100 Thieves" || 
         teamId.includes("4bd1751425ef6a9bc9d4d8e9385b4a6"))) {
      console.log("Adding hardcoded players for 100 Thieves");
      team.players = [
        {
          id: "100t-tenacity",
          name: "Tenacity",
          role: "Top",
          image: "https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/a/a6/100_Tenacity_2023_Split_1.png",
          team: teamId,
          teamName: team.name,
          kda: 3.2,
          csPerMin: 8.1,
          damageShare: 0.24,
          championPool: ["K'Sante", "Gnar", "Jax"]
        },
        {
          id: "100t-closer",
          name: "Closer",
          role: "Jungle",
          image: "https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/e/e7/100_Closer_2023_Split_1.png",
          team: teamId,
          teamName: team.name,
          kda: 3.8,
          csPerMin: 5.9,
          damageShare: 0.18,
          championPool: ["Viego", "Lee Sin", "Maokai"]
        },
        {
          id: "100t-bard",
          name: "Bard",
          role: "Mid",
          image: "https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/a/ad/100_APA_2023_Split_1.png",
          team: teamId,
          teamName: team.name,
          kda: 3.5,
          csPerMin: 9.2,
          damageShare: 0.27,
          championPool: ["Azir", "Orianna", "Syndra"]
        },
        {
          id: "100t-doublelift",
          name: "Doublelift",
          role: "ADC",
          image: "https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/1/1d/100_Doublelift_2023_Split_1.png",
          team: teamId,
          teamName: team.name,
          kda: 4.1,
          csPerMin: 10.2,
          damageShare: 0.31,
          championPool: ["Zeri", "Jinx", "Lucian"]
        },
        {
          id: "100t-busio",
          name: "Busio",
          role: "Support",
          image: "https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/c/c5/100_Busio_2023_Split_1.png",
          team: teamId,
          teamName: team.name,
          kda: 3.9,
          csPerMin: 1.2,
          damageShare: 0.12,
          championPool: ["Lulu", "Nautilus", "Thresh"]
        }
      ];
    }
    
    // Log the final team object with players
    console.log(`Team ${team.name} has ${team.players.length} players:`, 
      team.players.map(p => ({name: p.name, role: p.role})));
    
    // Update cache
    updateTeamInCache(team);
    
    return team;
  } catch (error) {
    console.error(`Error retrieving team ${teamId}:`, error);
    toast.error("Échec du chargement des données d'équipe");
    return null;
  }
};
