
import { getPlayers, getPlayersCount } from "@/utils/database/playersService";
import { Player } from "@/utils/models/types";
import { toast } from "sonner";
import { getAllTeams } from "@/services/teamService";
import { normalizeImageUrl } from "@/utils/database/teams/images/imageUtils";

/**
 * Load all players in batches to bypass the 1000 record limit in Supabase
 * @param progressCallback Optional callback to report loading progress
 * @returns Array of all players
 */
export const loadAllPlayersInBatches = async (
  progressCallback?: (loaded: number, total: number, batchNumber: number) => void
): Promise<Player[]> => {
  try {
    console.log("Starting batch loading of players");
    
    // Get total count to determine number of batches
    const totalCount = await getPlayersCount();
    console.log(`Total player count: ${totalCount}`);
    
    if (totalCount === 0) {
      console.log("No players found in database");
      return [];
    }
    
    const batchSize = 500; // Smaller batch size for more frequent updates
    const batches = Math.ceil(totalCount / batchSize);
    console.log(`Will load ${batches} batches of ${batchSize} players`);
    
    let allPlayers: Player[] = [];
    let loadedCount = 0;
    
    // Load each batch and combine results
    for (let batch = 1; batch <= batches; batch++) {
      console.log(`Loading batch ${batch}/${batches}`);
      
      try {
        const batchPlayers = await getPlayers(batch, batchSize);
        
        // Normalize image URLs in players data
        const normalizedPlayers = batchPlayers.map(player => ({
          ...player,
          image: normalizeImageUrl(player.image)
        }));
        
        console.log(`Batch ${batch}: loaded ${normalizedPlayers.length} players`);
        
        allPlayers = [...allPlayers, ...normalizedPlayers];
        loadedCount += normalizedPlayers.length;
        
        // Report progress if callback provided
        if (progressCallback) {
          progressCallback(loadedCount, totalCount, batch);
        }
        
        // Small delay between batches to avoid overwhelming the database
        if (batch < batches) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      } catch (error) {
        console.error(`Error loading batch ${batch}:`, error);
        toast.error(`Erreur lors du chargement du lot ${batch}`);
      }
    }
    
    console.log(`Completed loading ${allPlayers.length} players in ${batches} batches`);
    return allPlayers;
  } catch (error) {
    console.error("Error in loadAllPlayersInBatches:", error);
    toast.error("Erreur lors du chargement des joueurs");
    throw error;
  }
};

/**
 * Get players with pagination and enriched with team information
 */
export const getAllPlayers = async (page: number, pageSize: number): Promise<Player[]> => {
  try {
    console.log(`Getting players for page ${page} with page size ${pageSize}`);
    const players = await getPlayers(page, pageSize);
    
    // Normalize image URLs
    const normalizedPlayers = players.map(player => ({
      ...player,
      image: normalizeImageUrl(player.image)
    }));
    
    return normalizedPlayers;
  } catch (error) {
    console.error("Error getting all players:", error);
    toast.error("Erreur lors du chargement des joueurs");
    return [];
  }
};

/**
 * Search players by name or team name
 * This is a client-side search function to be used after players are loaded
 */
export const searchPlayers = async <T extends Player>(players: T[], searchTerm: string): Promise<T[]> => {
  const term = searchTerm.toLowerCase().trim();
  if (!term) return players;

  console.log(`Searching players for term: ${term}`);
  
  return players.filter(player => {
    const playerName = player.name.toLowerCase();
    // Check if the player has a teamName property 
    const teamName = 'teamName' in player ? (player as any).teamName?.toLowerCase() : '';
    
    return playerName.includes(term) || (teamName && teamName.includes(term));
  });
};

/**
 * Filter players by role, region, subregion and category
 * Client-side filtering to be used after players are loaded
 */
export const filterPlayers = (
  players: any[], 
  role: string, 
  region: string,
  subRegion: string,
  category: string,
  regionCategories: Record<string, string[]>
): Player[] => {
  console.log(`Filtering players - Role: ${role}, Region: ${region}, SubRegion: ${subRegion}, Category: ${category}`);
  
  return players.filter(player => {
    // Filter by role if specified
    if (role !== "All" && player.role !== role) {
      return false;
    }
    
    // Filter by team region if it exists
    if (region !== "All" && player.teamRegion !== region) {
      return false;
    }
    
    // Filter by sub-region if specified
    if (subRegion !== "All") {
      // This would depend on the data structure, assuming teamRegion would match the subRegion
      if (player.teamRegion !== subRegion) {
        return false;
      }
    }
    
    // Filter by category (a group of regions)
    if (category !== "All") {
      const regionsInCategory = regionCategories[category] || [];
      if (!regionsInCategory.includes(player.teamRegion) && !regionsInCategory.includes("All")) {
        return false;
      }
    }
    
    return true;
  });
};
