
import { supabase } from "@/integrations/supabase/client";
import { Player, PlayerRole } from '../models/types';
import { chunk } from '../dataConverter';
import { toast } from "sonner";
import { normalizeRoleName } from "../leagueData/assembler/modelConverter";
import { getLoadedPlayers, setLoadedPlayers, resetCache } from '../csv/cache/dataCache';

// Save players to database
export const savePlayers = async (players: Player[]): Promise<boolean> => {
  try {
    console.log(`Saving ${players.length} players to Supabase`);
    
    // Filter out players with no team ID to prevent foreign key constraint violations
    const validPlayers = players.filter(player => player.team && player.team.trim() !== '');
    
    if (validPlayers.length !== players.length) {
      console.log(`Filtered out ${players.length - validPlayers.length} players with missing team IDs`);
    }
    
    // Check for duplicate player IDs
    const playerIds = validPlayers.map(player => player.id);
    const uniquePlayerIds = new Set(playerIds);
    
    if (uniquePlayerIds.size !== validPlayers.length) {
      console.warn(`Found ${validPlayers.length - uniquePlayerIds.size} duplicate player IDs`);
      
      // Filter out duplicates, keeping only the first occurrence of each ID
      const seenIds = new Set<string>();
      const uniquePlayers = validPlayers.filter(player => {
        if (seenIds.has(player.id)) {
          return false;
        }
        seenIds.add(player.id);
        return true;
      });
      
      console.log(`Filtered down to ${uniquePlayers.length} unique players`);
      
      // Use the filtered list
      validPlayers.length = 0;
      validPlayers.push(...uniquePlayers);
    }
    
    // Insert players in batches of 50 using upsert
    let successCount = 0;
    const playerChunks = chunk(validPlayers, 50);
    
    for (const playerChunk of playerChunks) {
      try {
        const { error: playersError } = await supabase
          .from('players')
          .upsert(
            playerChunk.map(player => {
              // Handle champion pool parsing
              let championPoolArray: string[] = [];
              
              if (player.championPool) {
                if (Array.isArray(player.championPool)) {
                  championPoolArray = player.championPool;
                } else if (typeof player.championPool === 'string') {
                  // Use String() to ensure it's a string before calling split
                  championPoolArray = String(player.championPool).split(',').map(c => c.trim());
                }
              }
              
              // Always normalize the role before saving
              const normalizedRole = normalizeRoleName(player.role);
              
              return {
                id: player.id,
                name: player.name,
                role: normalizedRole, // Save normalized role
                image: player.image || '',
                team_id: player.team,
                kda: player.kda || 0,
                cs_per_min: player.csPerMin || 0,
                damage_share: player.damageShare || 0,
                champion_pool: championPoolArray
              };
            }),
            { onConflict: 'id' }
          );
        
        if (playersError) {
          console.error("Erreur lors de l'upsert des joueurs:", playersError);
          toast.error(`Erreur lors de la mise à jour des joueurs: ${playersError.message}`);
          continue; // Continue with the next batch
        }
        
        successCount += playerChunk.length;
      } catch (error) {
        console.error("Erreur lors du traitement d'un lot de joueurs:", error);
        continue; // Continue with next batch
      }
    }
    
    console.log(`Successfully upserted ${successCount}/${validPlayers.length} players`);
    
    // Clear the cache after successful save to ensure we get fresh data
    resetCache();
    
    return successCount > 0;
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des joueurs:", error);
    toast.error("Une erreur s'est produite lors de l'enregistrement des joueurs");
    return false;
  }
};

// Get players from database with better cache invalidation
export const getPlayers = async (forceRefresh = false): Promise<Player[]> => {
  // Skip cache if force refresh is requested
  const loadedPlayers = forceRefresh ? null : getLoadedPlayers();
  
  if (loadedPlayers) {
    console.log("Using cached players data");
    return loadedPlayers;
  }
  
  try {
    console.log("Fetching players from database");
    const { data: playersData, error: playersError } = await supabase
      .from('players')
      .select('*');
    
    if (playersError) {
      console.error("Erreur lors de la récupération des joueurs:", playersError);
      throw playersError;
    }
    
    if (!playersData || playersData.length === 0) {
      console.warn("No players found in database, using mock data");
      const { teams } = await import('../mockData');
      const mockPlayers = teams.flatMap(team => team.players || []);
      return mockPlayers;
    }
    
    console.log(`Retrieved ${playersData.length} players from database`);
    
    // Get unique team_ids for logging
    const uniqueTeamIds = [...new Set(playersData.map(p => p.team_id))];
    console.log(`Players belong to ${uniqueTeamIds.length} unique teams`);
    
    // Now we need to fetch team names and regions to enrich player data
    const { data: teamsData, error: teamsError } = await supabase
      .from('teams')
      .select('id, name, region');
      
    if (teamsError) {
      console.error("Erreur lors de la récupération des équipes pour enrichir les données des joueurs:", teamsError);
    }
    
    // Create a map of team_id to team info for quick lookup
    const teamInfoMap: Record<string, { name: string, region: string }> = {};
    if (teamsData) {
      teamsData.forEach(team => {
        teamInfoMap[team.id] = {
          name: team.name,
          region: team.region
        };
      });
    }
    
    const players: Player[] = playersData.map(player => {
      // Always normalize the role using our updated function
      const normalizedRole = normalizeRoleName(player.role);
      
      // Get team info from our map
      const teamInfo = teamInfoMap[player.team_id] || { name: "", region: "" };
      
      return {
        id: player.id as string,
        name: player.name as string,
        role: normalizedRole,
        image: player.image as string,
        team: player.team_id as string,
        teamName: teamInfo.name,           // Add team name from our map
        teamRegion: teamInfo.region,       // Add team region from our map
        kda: Number(player.kda) || 0,
        csPerMin: Number(player.cs_per_min) || 0,
        damageShare: Number(player.damage_share) || 0,
        championPool: player.champion_pool as string[] || []
      };
    });
    
    // Log normalized player roles
    const roleCounts = players.reduce((acc, p) => {
      acc[p.role] = (acc[p.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log("Player counts by normalized role:", roleCounts);
    
    // Log info about each region's players for better debugging
    const regionCounts: Record<string, number> = {};
    players.forEach(p => {
      if (p.teamRegion) {
        regionCounts[p.teamRegion] = (regionCounts[p.teamRegion] || 0) + 1;
      }
    });
    console.log("Players by region:", regionCounts);
    
    // Check LCK players specifically
    const lckPlayers = players.filter(p => p.teamRegion === 'LCK');
    console.log(`Found ${lckPlayers.length} LCK players`);
    if (lckPlayers.length > 0) {
      console.log("LCK players sample:", lckPlayers.slice(0, 3).map(p => `${p.name} (${p.role})`));
    }
    
    // Cache the results
    setLoadedPlayers(players);
    
    return players;
  } catch (error) {
    console.error("Erreur lors de la récupération des joueurs:", error);
    const { teams } = await import('../mockData');
    const fallbackPlayers = teams.flatMap(team => team.players || []);
    return fallbackPlayers;
  }
};

// Get player by ID with better team info
export const getPlayerById = async (playerId: string, forceRefresh = false): Promise<Player | null> => {
  try {
    // Check loaded players first unless force refresh is requested
    const loadedPlayers = forceRefresh ? null : getLoadedPlayers();
    if (loadedPlayers) {
      const player = loadedPlayers.find(p => p.id === playerId);
      if (player) {
        console.log(`Found player ${player.name} in cache`);
        return player;
      }
    }
    
    // If not found in loaded players, query the database
    const { data: playerData, error } = await supabase
      .from('players')
      .select('*')
      .eq('id', playerId)
      .single();
    
    if (error || !playerData) {
      console.error("Error fetching player by ID:", error);
      return null;
    }
    
    // Get team info to enrich the player data
    const { data: teamData } = await supabase
      .from('teams')
      .select('name, region')
      .eq('id', playerData.team_id)
      .single();
    
    // Always normalize the role
    const normalizedRole = normalizeRoleName(playerData.role);
    
    // Convert database format to application format
    const player: Player = {
      id: playerData.id as string,
      name: playerData.name as string,
      role: normalizedRole,
      image: playerData.image as string,
      team: playerData.team_id as string,
      teamName: teamData?.name || "",
      teamRegion: teamData?.region || "",
      kda: Number(playerData.kda) || 0,
      csPerMin: Number(playerData.cs_per_min) || 0,
      damageShare: Number(playerData.damage_share) || 0,
      championPool: playerData.champion_pool as string[] || []
    };
    
    return player;
  } catch (error) {
    console.error("Error retrieving player by ID:", error);
    
    // Fallback to mock data if database query fails
    const { players } = await import('../models/mockPlayers');
    return players.find(p => p.id === playerId) || null;
  }
};

// Clear player cache
export const clearPlayerCache = () => {
  setLoadedPlayers(null);
  console.log("Player cache cleared");
};
