
import { getPlayers, getPlayersCount } from "@/utils/database/playersService";
import { Player } from "@/utils/models/types";
import { toast } from "sonner";

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
        console.log(`Batch ${batch}: loaded ${batchPlayers.length} players`);
        
        allPlayers = [...allPlayers, ...batchPlayers];
        loadedCount += batchPlayers.length;
        
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
