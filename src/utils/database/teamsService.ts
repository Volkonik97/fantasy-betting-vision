
import { supabase } from "@/integrations/supabase/client";
import { Team } from '../models/types';
import { chunk } from '../dataConverter';
import { toast } from "sonner";

// Cache for teams data
let teamsCache: Team[] | null = null;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
let lastCacheUpdate = 0;

// Save teams to database
export const saveTeams = async (teams: Team[]): Promise<boolean> => {
  try {
    console.log(`Saving ${teams.length} teams to Supabase`);
    
    // Clear cache when saving new teams
    teamsCache = null;
    
    // Check for duplicate team IDs
    const teamIds = teams.map(team => team.id);
    const uniqueTeamIds = new Set(teamIds);
    
    if (uniqueTeamIds.size !== teams.length) {
      console.warn(`Found ${teams.length - uniqueTeamIds.size} duplicate team IDs in the input data`);
      
      // Create a map to find duplicates
      const idCounts = teamIds.reduce((acc, id) => {
        acc[id] = (acc[id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      // Log duplicates
      Object.entries(idCounts)
        .filter(([_, count]) => count > 1)
        .forEach(([id, count]) => {
          console.warn(`Team ID "${id}" appears ${count} times`);
        });
      
      // Filter out duplicates, keeping only the first occurrence of each ID
      const seenIds = new Set<string>();
      teams = teams.filter(team => {
        if (seenIds.has(team.id)) {
          return false;
        }
        seenIds.add(team.id);
        return true;
      });
      
      console.log(`Filtered down to ${teams.length} unique teams`);
    }
    
    // Insert teams in batches of 50 using upsert (on conflict update)
    const teamChunks = chunk(teams, 50);
    let successCount = 0;
    
    for (const teamChunk of teamChunks) {
      try {
        const { error: teamsError } = await supabase
          .from('teams')
          .upsert(
            teamChunk.map(team => ({
              id: team.id,
              name: team.name,
              logo: team.logo,
              region: team.region,
              win_rate: team.winRate,
              blue_win_rate: team.blueWinRate,
              red_win_rate: team.redWinRate,
              average_game_time: team.averageGameTime
            })),
            { onConflict: 'id' }
          );
        
        if (teamsError) {
          console.error("Error upserting teams batch:", teamsError);
          toast.error(`Erreur lors de la mise à jour des équipes: ${teamsError.message}`);
          continue; // Continue with the next batch rather than stopping everything
        }
        
        successCount += teamChunk.length;
      } catch (error) {
        console.error("Error during team batch upsert:", error);
        continue; // Continue with the next batch
      }
    }
    
    console.log(`Successfully upserted ${successCount}/${teams.length} teams`);
    return successCount > 0;
  } catch (error) {
    console.error("Error saving teams:", error);
    toast.error("Une erreur s'est produite lors de l'enregistrement des équipes");
    return false;
  }
};

// Get teams from database
export const getTeams = async (): Promise<Team[]> => {
  try {
    // Check if we have a recent cache
    const now = Date.now();
    if (teamsCache && (now - lastCacheUpdate) < CACHE_DURATION) {
      console.log("Using cached teams data");
      return teamsCache;
    }
    
    console.log("Fetching teams from Supabase");
    
    // Fetch teams from database
    const { data: teamsData, error: teamsError } = await supabase
      .from('teams')
      .select('*');
    
    if (teamsError) {
      console.error("Error retrieving teams:", teamsError);
      throw teamsError;
    }
    
    if (!teamsData || teamsData.length === 0) {
      console.warn("No teams found in database, using mock data");
      const { teams } = await import('../models/mockTeams');
      return teams;
    }
    
    console.log(`Found ${teamsData.length} teams in database`);
    
    // Fetch players for these teams
    const { data: playersData, error: playersError } = await supabase
      .from('players')
      .select('*');
    
    if (playersError) {
      console.error("Error retrieving players:", playersError);
      // Continue without players
    }
    
    // Convert database format to application format
    const teams: Team[] = teamsData.map(team => ({
      id: team.id as string,
      name: team.name as string,
      logo: team.logo as string,
      region: team.region as string,
      winRate: Number(team.win_rate) || 0,
      blueWinRate: Number(team.blue_win_rate) || 0,
      redWinRate: Number(team.red_win_rate) || 0,
      averageGameTime: Number(team.average_game_time) || 0, // Retrieved in seconds
      players: []
    }));
    
    // Assign players to their teams
    if (playersData && playersData.length > 0) {
      teams.forEach(team => {
        team.players = playersData
          .filter(player => player.team_id === team.id)
          .map(player => ({
            id: player.id as string,
            name: player.name as string,
            role: (player.role || 'Mid') as 'Top' | 'Jungle' | 'Mid' | 'ADC' | 'Support',
            image: player.image as string,
            team: player.team_id as string,
            kda: Number(player.kda) || 0,
            csPerMin: Number(player.cs_per_min) || 0,
            damageShare: Number(player.damage_share) || 0,
            championPool: player.champion_pool as string[] || []
          }));
      });
    }
    
    // Cache the results
    teamsCache = teams;
    lastCacheUpdate = now;
    
    return teams;
  } catch (error) {
    console.error("Error retrieving teams:", error);
    toast.error("Échec du chargement des données d'équipe");
    
    // Fall back to mock data
    const { teams } = await import('../models/mockTeams');
    return teams;
  }
};

// Get a single team by ID
export const getTeamById = async (teamId: string): Promise<Team | null> => {
  try {
    if (!teamId) {
      console.error("No team ID provided");
      return null;
    }
    
    // Try to find in cache first
    if (teamsCache) {
      const cachedTeam = teamsCache.find(t => t.id === teamId);
      if (cachedTeam) {
        console.log(`Found team ${teamId} in cache`);
        return cachedTeam;
      }
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
    
    // Fetch players for this team
    const { data: playersData, error: playersError } = await supabase
      .from('players')
      .select('*')
      .eq('team_id', teamId);
    
    if (playersError) {
      console.error(`Error retrieving players for team ${teamId}:`, playersError);
      // Continue without players
    }
    
    // Convert database format to application format
    const team: Team = {
      id: teamData.id as string,
      name: teamData.name as string,
      logo: teamData.logo as string,
      region: teamData.region as string,
      winRate: Number(teamData.win_rate) || 0,
      blueWinRate: Number(teamData.blue_win_rate) || 0,
      redWinRate: Number(teamData.red_win_rate) || 0,
      averageGameTime: Number(teamData.average_game_time) || 0,
      players: []
    };
    
    // Assign players to the team
    if (playersData && playersData.length > 0) {
      team.players = playersData.map(player => ({
        id: player.id as string,
        name: player.name as string,
        role: (player.role || 'Mid') as 'Top' | 'Jungle' | 'Mid' | 'ADC' | 'Support',
        image: player.image as string,
        team: player.team_id as string,
        kda: Number(player.kda) || 0,
        csPerMin: Number(player.cs_per_min) || 0,
        damageShare: Number(player.damage_share) || 0,
        championPool: player.champion_pool as string[] || []
      }));
    }
    
    // Update cache if needed
    if (teamsCache) {
      const index = teamsCache.findIndex(t => t.id === teamId);
      if (index >= 0) {
        teamsCache[index] = team;
      } else {
        teamsCache.push(team);
      }
    }
    
    return team;
  } catch (error) {
    console.error(`Error retrieving team ${teamId}:`, error);
    toast.error("Échec du chargement des données d'équipe");
    return null;
  }
};
