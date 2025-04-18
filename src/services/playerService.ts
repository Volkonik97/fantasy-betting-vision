import { getPlayers, getPlayersCount } from "@/utils/database/playersService";
import { Player } from "@/utils/models/types";
import { toast } from "sonner";
import { normalizeImageUrl } from "@/utils/database/teams/images/imageUtils";
import { supabase } from "@/integrations/supabase/client";
import { getAllTeams } from "@/services/teamService";
import { adaptPlayerFromDatabase } from "@/utils/database/adapters/playerAdapter";

// Cache for player images in storage
let playerImagesCache: string[] = [];
let playerImagesCacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Force refresh of player images cache
 */
export const forceRefreshPlayerImagesCache = async (): Promise<void> => {
  playerImagesCacheTimestamp = 0; // Reset timestamp to force refresh
  await preloadPlayerImagesCache();
};

/**
 * Preload the player images cache
 */
export const preloadPlayerImagesCache = async (): Promise<void> => {
  try {
    const now = Date.now();
    // Reload cache if needed
    if (playerImagesCache.length === 0 || (now - playerImagesCacheTimestamp) > CACHE_DURATION) {
      console.log("Preloading player images cache...");
      
      const { data, error } = await supabase
        .storage
        .from('player-images')
        .list('');
      
      if (error) {
        console.error("Error loading player images:", error);
        return;
      }
      
      playerImagesCache = data ? data.map(item => item.name) : [];
      playerImagesCacheTimestamp = now;
      
      console.log(`Player images cache updated: ${playerImagesCache.length} images`);
    }
  } catch (error) {
    console.error("Error preloading images cache:", error);
  }
};

/**
 * Check if an image exists for a player ID
 */
export const hasImageForPlayer = (playerId: string): boolean => {
  if (!playerId) return false;
  
  // Check if any file starts with 'playerid' + playerId
  const hasImage = playerImagesCache.some(filename => 
    filename.startsWith(`playerid${playerId}`)
  );
  
  console.log(`Checking if player ${playerId} has image: ${hasImage}`);
  return hasImage;
};

/**
 * Load all players in batches
 */
export const loadAllPlayersInBatches = async (
  progressCallback?: (loaded: number, total: number, batchNumber: number) => void
): Promise<Player[]> => {
  try {
    console.log("Starting batch loading of players");
    
    // Preload images cache
    await preloadPlayerImagesCache();
    
    // Get total count
    const totalCount = await getPlayersCount();
    console.log(`Total player count: ${totalCount}`);
    
    if (totalCount === 0) {
      console.log("No players found in database");
      return [];
    }
    
    const batchSize = 500;
    const batches = Math.ceil(totalCount / batchSize);
    console.log(`Will load ${batches} batches of ${batchSize} players`);
    
    let allPlayers: Player[] = [];
    let loadedCount = 0;
    
    // Process each batch
    for (let batch = 1; batch <= batches; batch++) {
      console.log(`Loading batch ${batch}/${batches}`);
      
      try {
        // Here we call getPlayers which now explicitly selects the image field
        const batchPlayers = await getPlayers(batch, batchSize);
        
        // Process each player's image
        const normalizedPlayers = batchPlayers.map(player => {
          // Check if player has an image in cache
          const hasImage = hasImageForPlayer(player.id);
          
          // Use existing image URL or generate one from player ID if image exists in cache
          let imageUrl = player.image;
          
          if (!imageUrl && hasImage) {
            // Create URL from player ID
            const { data } = supabase
              .storage
              .from('player-images')
              .getPublicUrl(`playerid${player.id}.webp`);
            
            imageUrl = data.publicUrl;
            console.log(`Generated URL for player ${player.id}: ${imageUrl}`);
          } else if (imageUrl) {
            // Normalize existing URL
            const normalizedUrl = normalizeImageUrl(imageUrl);
            console.log(`Normalized URL for player ${player.id}: ${normalizedUrl}`);
            imageUrl = normalizedUrl;
          }
          
          return {
            ...player,
            image: imageUrl
          };
        });
        
        allPlayers = [...allPlayers, ...normalizedPlayers];
        loadedCount += normalizedPlayers.length;
        
        // Report progress
        if (progressCallback) {
          progressCallback(loadedCount, totalCount, batch);
        }
        
        // Small delay between batches
        if (batch < batches) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      } catch (error) {
        console.error(`Error loading batch ${batch}:`, error);
        toast.error(`Error loading batch ${batch}`);
      }
    }
    
    // Log player image stats
    const playersWithImages = allPlayers.filter(p => p.image).length;
    console.log(`Loaded ${allPlayers.length} players with ${playersWithImages} having images`);
    
    return allPlayers;
  } catch (error) {
    console.error("Error in loadAllPlayersInBatches:", error);
    toast.error("Error loading players");
    throw error;
  }
};

/**
 * Get players with pagination and enriched with team information
 */
export const getAllPlayers = async (page: number, pageSize: number): Promise<Player[]> => {
  try {
    console.log(`Getting players for page ${page} with page size ${pageSize}`);
    
    // Précharger le cache des images
    await preloadPlayerImagesCache();
    
    const players = await getPlayers(page, pageSize);
    const adaptedPlayers = players.map(adaptPlayerFromDatabase);

    
    // Normalize image URLs
    const normalizedPlayers = players.map(player => {
      // Vérifier d'abord si nous avons une image dans le cache pour cet ID de joueur
      const hasImageInCache = hasImageForPlayer(player.id);
      
      // Si le joueur a déjà une URL d'image, la normaliser
      // Sinon, utiliser l'ID du joueur si nous savons qu'il a une image dans le cache
      const imageToNormalize = player.image || (hasImageInCache ? `playerid${player.id}` : null);
      
      // Normaliser l'URL de l'image
      const normalizedImageUrl = normalizeImageUrl(imageToNormalize);
      
      console.log(`Joueur ${player.name} (ID: ${player.id}), image originale: ${player.image}, cache: ${hasImageInCache}, normalisée: ${normalizedImageUrl}`);
      
      return {
        ...player,
        image: normalizedImageUrl
      };
    });
    
    // Log debugging info
    const playersWithImages = normalizedPlayers.filter(p => p.image).length;
    console.log(`Loaded ${normalizedPlayers.length} players, ${playersWithImages} with images`);
    
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
