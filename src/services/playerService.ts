import { getPlayers, getPlayersCount } from "@/utils/database/playersService";
import { Player } from "@/utils/models/types";
import { toast } from "sonner";
import { getAllTeams } from "@/services/teamService";
import { normalizeImageUrl, hasPlayerImage, listAllPlayerImages } from "@/utils/database/teams/images/imageUtils";

// Cache pour les images des joueurs existantes dans le storage
let playerImagesCache: string[] = [];
let playerImagesCacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Charge toutes les images disponibles dans le cache
 */
export const preloadPlayerImagesCache = async (): Promise<void> => {
  const now = Date.now();
  // Recharger le cache si nécessaire
  if (playerImagesCache.length === 0 || (now - playerImagesCacheTimestamp) > CACHE_DURATION) {
    console.log("Préchargement du cache des images de joueurs...");
    playerImagesCache = await listAllPlayerImages();
    playerImagesCacheTimestamp = now;
    console.log(`Cache des images mis à jour: ${playerImagesCache.length} images`);

    // Log pour déboguer les noms de fichiers d'images
    console.log("Échantillon de noms d'images dans le cache:", 
      playerImagesCache.slice(0, 10));

    // Analyser les noms de fichiers pour identifier les ID de joueurs
    const playerIds = new Set<string>();
    playerImagesCache.forEach(filename => {
      // Format attendu: playeridXXXX où XXXX est l'ID du joueur
      if (filename.startsWith('playerid')) {
        const playerId = filename.replace('playerid', '').split('_')[0];
        if (playerId) {
          playerIds.add(playerId);
        }
      }
    });
    
    console.log(`IDs de joueurs identifiés depuis les noms de fichiers: ${playerIds.size}`);
    console.log("Échantillon d'IDs de joueurs:", Array.from(playerIds).slice(0, 10));
  }
};

/**
 * Vérifie si une image existe dans le cache pour un ID de joueur spécifique
 */
export const imageExistsForPlayer = (playerId: string): boolean => {
  if (!playerId) return false;
  
  // Vérifier si un fichier commence par 'playerid' + ID du joueur
  return playerImagesCache.some(filename => {
    return filename.startsWith(`playerid${playerId}`);
  });
};

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
    
    // Précharger le cache des images
    await preloadPlayerImagesCache();
    
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
        const normalizedPlayers = batchPlayers.map(player => {
          // Normaliser l'URL de l'image
          const normalizedImageUrl = normalizeImageUrl(player.image);
          console.log(`Joueur ${player.name}, image originale: ${player.image}, normalisée: ${normalizedImageUrl}`);
          
          return {
            ...player,
            image: normalizedImageUrl
          };
        });
        
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
    
    // Count players with images for debugging
    const playersWithImages = allPlayers.filter(p => p.image).length;
    console.log(`Completed loading ${allPlayers.length} players with ${playersWithImages} having images`);
    
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
    
    // Précharger le cache des images
    await preloadPlayerImagesCache();
    
    const players = await getPlayers(page, pageSize);
    
    // Normalize image URLs
    const normalizedPlayers = players.map(player => {
      // Vérifier d'abord si nous avons une image dans le cache pour cet ID de joueur
      const hasImageInCache = imageExistsForPlayer(player.id);
      
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
