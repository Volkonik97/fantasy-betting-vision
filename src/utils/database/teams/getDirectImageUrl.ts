
/**
 * Utility function to generate direct URLs to player images
 */

// Base URL for player images in Supabase storage
const PLAYER_IMAGES_BASE_URL = "https://nbioauymqggfafmsuigr.supabase.co/storage/v1/object/public/player-images";

/**
 * Generate a direct URL to a player image using their ID
 * @param playerId The ID of the player
 * @returns A URL to the player's image
 */
export const getDirectPlayerImageUrl = (playerId: string): string => {
  // Sanitize the player ID to ensure it's safe to use in a URL
  const safePlayerId = playerId.replace(/[^a-zA-Z0-9-_]/g, '');
  
  // Construct the image URL with the playerid prefix
  return `${PLAYER_IMAGES_BASE_URL}/playerid${safePlayerId}.webp`;
};
