
import { supabase } from "@/integrations/supabase/client";
import { Player } from "@/utils/models/types";
import { adaptPlayerFromDatabase } from "./adapters/playerAdapter";
import { toast } from "sonner";
import { getLoadedPlayers, setLoadedPlayers } from '../csv/cache/dataCache';

export const getPlayerById = async (playerId: string): Promise<Player | null> => {
  try {
    console.log("Fetching player with ID:", playerId);
    
    // First try fetching from player_summary_view which has the vspm, wcpm, and damage_share fields
    const { data: summaryData, error: summaryError } = await supabase
      .from('player_summary_view')
      .select('*')
      .eq('playerid', playerId)
      .single();
    
    if (summaryData) {
      console.log("Found player in player_summary_view:", summaryData);
      console.log("Vision stats from view:", { 
        vspm: summaryData.vspm, 
        wcpm: summaryData.wcpm 
      });
      console.log("Gold share stats from view:", {
        gold_share_percent: summaryData.gold_share_percent
      });
      console.log("Kill participation from view:", {
        kill_participation_pct: summaryData.kill_participation_pct
      });
      
      // Check if image property exists before logging
      if ('image' in summaryData && summaryData.image) {
        console.log("Player image URL:", summaryData.image);
      }
      
      return adaptPlayerFromDatabase(summaryData);
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
    
    // Check if image property exists before logging
    if ('image' in data && data.image) {
      console.log("Player image URL from players table:", data.image);
    }
    
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
    
    // Prepare the query to player_summary_view which has vspm, wcpm and gold_share_percent fields
    // Explicitly specify the fields we need, including the kill_participation_pct field
    let query = supabase.from('player_summary_view').select('playerid, playername, position, image, teamid, cspm, dpm, damage_share, vspm, wcpm, kda, gold_share_percent, damageshare, earnedgoldshare, golddiffat15, xpdiffat15, csdiffat15, kill_participation_pct, dmg_per_gold, efficiency_score, aggression_score, earlygame_score, avg_kills, avg_deaths, avg_assists');
    
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
    
    const adaptedPlayers = data.map(player => adaptPlayerFromDatabase(player));
    console.log(`Retrieved ${adaptedPlayers.length} players from player_summary_view with vision stats`);
    
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
      
      // Log image URL information for debugging
      const playersWithImages = adaptedPlayers.filter(p => p.image);
      console.log(`Players with image URLs: ${playersWithImages.length}/${adaptedPlayers.length}`);
      if (playersWithImages.length > 0) {
        console.log("Sample image URLs:", playersWithImages.slice(0, 3).map(p => ({
          name: p.name,
          image: p.image
        })));
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
