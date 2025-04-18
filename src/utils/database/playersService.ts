import { supabase } from "@/integrations/supabase/client";
import { Player } from "@/utils/models/types";
import { adaptPlayerFromDatabase } from "./adapters/playerAdapter";
import { toast } from "sonner";
import { getLoadedPlayers, setLoadedPlayers } from '../csv/cache/dataCache';

export const getPlayerById = async (playerId: string): Promise<Player | null> => {
  try {
    console.log("Fetching player with ID:", playerId);
    
    // Always use player_summary_view for consistent data retrieval
    const { data: summaryData, error: summaryError } = await supabase
      .from('player_summary_view')
      .select('*')
      .eq('playerid', playerId)
      .single();
    
    if (summaryData) {
      console.log("Found player in player_summary_view:", summaryData);
      console.log("Kill participation from view:", {
        kill_participation_pct: summaryData.kill_participation_pct,
        type: typeof summaryData.kill_participation_pct
      });
      
      // Get player image from players table as it's not in the view
      const { data: playerImageData, error: playerImageError } = await supabase
        .from('players')
        .select('image')
        .eq('playerid', playerId)
        .single();
        
      if (playerImageData && playerImageData.image) {
        // TypeScript safe assignment with type assertion
        const summaryWithImage = {
          ...summaryData,
          image: playerImageData.image 
        };
        console.log("Added player image from players table:", playerImageData.image);
        return adaptPlayerFromDatabase(summaryWithImage);
      }
      
      return adaptPlayerFromDatabase(summaryData);
    }
    
    if (summaryError) {
      console.error("Error fetching player from summary view:", summaryError);
    }
    
    console.log("Player not found in player_summary_view, trying players table");
    
    // Fall back to the players table if not found in the view
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('playerid', playerId)
      .single();
    
    if (error) {
      console.error("Error fetching player:", error);
      return null;
    }
    
    if (!data) {
      console.warn(`No player found with ID: ${playerId}`);
      return null;
    }
    
    console.log("Found player in players table:", data);
    
    return adaptPlayerFromDatabase(data);
  } catch (error) {
    console.error("Error in getPlayerById:", error);
    return null;
  }
};

export const getPlayers = async (page?: number, pageSize?: number): Promise<Player[]> => {
  try {
    console.log(`Fetching players (page: ${page}, pageSize: ${pageSize})`);
    
    // Try to use the cache first if we're not doing pagination
    if (!page && !pageSize) {
      const cachedPlayers = getLoadedPlayers();
      if (cachedPlayers && cachedPlayers.length > 0) {
        console.log(`Retrieved ${cachedPlayers.length} players from cache`);
        return cachedPlayers;
      }
    }
    
    // Always use the player_summary_view for consistent data retrieval with explicit field selection
    let query = supabase.from('player_summary_view').select(
      'playerid, playername, position, teamid, kda, cspm, dpm, damage_share, vspm, wcpm, ' + 
      'kill_participation_pct, gold_share_percent, golddiffat15, xpdiffat15, csdiffat15, ' +
      'dmg_per_gold, efficiency_score, aggression_score, earlygame_score, avg_kills, avg_deaths, avg_assists'
    );
    
    // Apply pagination if provided
    if (page !== undefined && pageSize !== undefined) {
      const start = (page - 1) * pageSize;
      const end = start + pageSize - 1;
      query = query.range(start, end);
    }
    
    // Execute the query
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching players from player_summary_view:", error);
      
      // Fall back to players table
      console.log("Falling back to players table");
      let fallbackQuery = supabase.from('players').select('*');
      
      if (page !== undefined && pageSize !== undefined) {
        const start = (page - 1) * pageSize;
        const end = start + pageSize - 1;
        fallbackQuery = fallbackQuery.range(start, end);
      }
      
      const { data: fallbackData, error: fallbackError } = await fallbackQuery;
      
      if (fallbackError) {
        console.error("Error in fallback player fetch:", fallbackError);
        return [];
      }
      
      if (!fallbackData || fallbackData.length === 0) {
        console.warn("No players found");
        return [];
      }
      
      const adaptedPlayers = fallbackData.map(player => adaptPlayerFromDatabase(player));
      console.log(`Retrieved ${adaptedPlayers.length} players from fallback`);
      
      // Only update cache if we fetched all players (no pagination) and we're not in a paginated request
      if (!page && !pageSize) {
        setLoadedPlayers(adaptedPlayers);
      }
      
      return adaptedPlayers;
    }
    
    if (!data || data.length === 0) {
      console.warn("No players found in player_summary_view");
      return [];
    }
    
    // Need to get player images from players table as they're not in the view
    // First, create a safe array of playerIds
    const playerIdsArray: string[] = [];
    
    // Safely collect valid player IDs
    if (data && Array.isArray(data)) {
      data.forEach(item => {
        if (item && typeof item === 'object' && 'playerid' in item && typeof item.playerid === 'string') {
          playerIdsArray.push(item.playerid);
        }
      });
    }
    
    // Type guard to ensure we have valid player IDs
    if (playerIdsArray.length === 0) {
      console.warn("No valid player IDs available to fetch images");
      
      // Process data safely without player images
      const adaptedPlayers = [];
      if (data && Array.isArray(data)) {
        for (const item of data) {
          // More strict null check and type guard
          if (item && typeof item === 'object' && item !== null) {
            // Use type assertion after verification
            const playerData = item as Record<string, unknown>;
            adaptedPlayers.push(adaptPlayerFromDatabase({...playerData, image: ''}));
          }
        }
      }
      
      return adaptedPlayers;
    }
    
    const { data: playerImageData, error: playerImageError } = await supabase
      .from('players')
      .select('playerid, image')
      .in('playerid', playerIdsArray);
      
    // Create a map for quick image lookup
    const imageMap = new Map<string, string>();
    if (playerImageData && !playerImageError) {
      playerImageData.forEach(item => {
        if (item && typeof item === 'object' && 'playerid' in item && 'image' in item && item.playerid) {
          imageMap.set(item.playerid, item.image || '');
        }
      });
      console.log(`Retrieved ${imageMap.size} player images`);
    }
    
    // Add images to the player data with proper type checking
    const playersWithImages: Record<string, unknown>[] = [];
    
    // Process each player safely
    if (data && Array.isArray(data)) {
      data.forEach(item => {
        if (item && typeof item === 'object' && item !== null) {
          // Verified it's a non-null object, now safe to convert
          const playerObj = item as Record<string, unknown>;
          
          // Check if it has a valid playerid - with explicit null check
          if ('playerid' in playerObj && 
              playerObj.playerid !== null && 
              playerObj.playerid !== undefined && 
              typeof playerObj.playerid === 'string') {
            
            // Get image if available
            const image = imageMap.get(playerObj.playerid) || '';
            playersWithImages.push({...playerObj, image});
          } else {
            // No valid ID, still include but with empty image
            playersWithImages.push({...playerObj, image: ''});
          }
        }
      });
    }
    
    const adaptedPlayers = playersWithImages.map(player => adaptPlayerFromDatabase(player));
    console.log(`Retrieved ${adaptedPlayers.length} players from player_summary_view`);
    
    // Log some samples of vision stats, gold share, and kill participation
    if (adaptedPlayers.length > 0) {
      const samplePlayer = adaptedPlayers[0];
      console.log("Sample stats:", {
        player: samplePlayer.name,
        vspm: samplePlayer.vspm,
        wcpm: samplePlayer.wcpm,
        gold_share_percent: samplePlayer.gold_share_percent,
        killParticipation: samplePlayer.killParticipation,
        kill_participation_pct: samplePlayer.kill_participation_pct
      });
      
      // Check for players with non-zero kill participation
      const playersWithKP = adaptedPlayers.filter(p => 
        (p.killParticipation && p.killParticipation > 0) || 
        (p.kill_participation_pct && p.kill_participation_pct > 0)
      );
      
      if (playersWithKP.length > 0) {
        console.log(`Found ${playersWithKP.length} players with non-zero kill participation. Sample:`, 
          playersWithKP.slice(0, 3).map(p => ({
            name: p.name,
            killParticipation: p.killParticipation,
            kill_participation_pct: p.kill_participation_pct
          }))
        );
      } else {
        console.warn("No players found with non-zero kill participation");
      }
    }
    
    // Only update cache if we fetched all players (no pagination) and we're not in a paginated request
    if (!page && !pageSize) {
      setLoadedPlayers(adaptedPlayers);
    }
    
    return adaptedPlayers;
  } catch (error) {
    console.error("Error in getPlayers:", error);
    toast.error("Erreur lors du chargement des joueurs");
    return [];
  }
};

/**
 * Get the total number of players
 */
export const getPlayersCount = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('players')
      .select('*', { count: 'exact', head: true }) as { count: number; error: any };

    if (error) {
      console.error("Error fetching players count:", error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error("Error in getPlayersCount:", error);
    return 0;
  }
};
