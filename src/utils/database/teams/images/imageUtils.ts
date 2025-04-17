
import { supabase } from "@/integrations/supabase/client";

/**
 * Normalize an image URL to ensure it's usable
 */
export const normalizeImageUrl = (imageUrl: string | null | undefined): string | null => {
  if (!imageUrl) return null;
  
  // Clean up the URL by trimming whitespace
  const cleanUrl = imageUrl.trim();
  
  // Log for debugging
  console.log(`Normalizing image URL: ${cleanUrl}`);
  
  // Special case for blob URLs (file previews) - return as is
  if (cleanUrl.startsWith('blob:')) {
    console.log(`Using blob URL as is: ${cleanUrl}`);
    return cleanUrl;
  }
  
  // If it's already a complete Supabase Storage URL, return it with cache buster
  if (cleanUrl.includes('supabase.co/storage')) {
    // Fix any double slashes in URLs except for https://
    const fixedUrl = cleanUrl.replace(/([^:])\/\//g, '$1/');
    
    // Remove any existing cache buster parameter
    const urlWithoutParams = fixedUrl.split('?')[0];
    
    // Add a new cache buster parameter
    const cacheBuster = `?t=${Date.now()}`;
    console.log(`Normalized Supabase URL: ${urlWithoutParams}${cacheBuster}`);
    return urlWithoutParams + cacheBuster;
  }
  
  // If it's an absolute URL, return it with cache buster
  if (cleanUrl.startsWith('http')) {
    // Remove any existing cache buster parameter
    const urlWithoutParams = cleanUrl.split('?')[0];
    
    // Add a new cache buster parameter
    const cacheBuster = `?t=${Date.now()}`;
    console.log(`Normalized absolute URL: ${urlWithoutParams}${cacheBuster}`);
    return urlWithoutParams + cacheBuster;
  }
  
  // If it's a path to the public folder, add leading slash if needed
  if (cleanUrl.startsWith('lovable-uploads/')) {
    const urlWithoutParams = cleanUrl.split('?')[0];
    const cacheBuster = `?t=${Date.now()}`;
    console.log(`Normalized public path: /${urlWithoutParams}${cacheBuster}`);
    return `/${urlWithoutParams}${cacheBuster}`;
  }
  
  // If it's a player ID (with or without the 'playerid' prefix)
  try {
    const playerId = cleanUrl.startsWith('playerid') 
      ? cleanUrl 
      : `playerid${cleanUrl}`;
    
    // Generate the public URL for the image in the player-images bucket
    const { data } = supabase
      .storage
      .from('player-images')
      .getPublicUrl(playerId);
      
    // Add cache buster to prevent caching issues
    const publicUrlWithCacheBuster = `${data.publicUrl}?t=${Date.now()}`;
    console.log(`Generated Supabase URL for player ${cleanUrl}: ${publicUrlWithCacheBuster}`);
    return publicUrlWithCacheBuster;
  } catch (error) {
    console.error("Error creating URL from player ID:", error);
    return null;
  }
};

/**
 * Check if a player has a valid image
 */
export const hasPlayerImage = (player: { image?: string | null } | string | null | undefined): boolean => {
  if (!player) return false;
  
  // If player is a string (URL)
  if (typeof player === 'string') {
    return player.trim().length > 0;
  }
  
  // If player is an object with image property
  if (typeof player === 'object' && 'image' in player) {
    return !!player.image && player.image.trim().length > 0;
  }
  
  return false;
};

/**
 * Check if an image exists for a specific player ID
 */
export const imageExistsForPlayer = async (playerId: string): Promise<boolean> => {
  if (!playerId) return false;
  
  try {
    // Look for files with the playerid prefix
    const { data, error } = await supabase
      .storage
      .from('player-images')
      .list('', {
        search: `playerid${playerId}`
      });
    
    if (error) {
      console.error("Error checking player image existence:", error);
      return false;
    }
    
    return data && data.length > 0;
  } catch (error) {
    console.error("Error accessing storage:", error);
    return false;
  }
};

/**
 * Retrieve a list of all images in the player-images bucket
 */
export const listAllPlayerImages = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .storage
      .from('player-images')
      .list('', {
        sortBy: { column: 'name', order: 'asc' }
      });
    
    if (error) {
      console.error("Error listing player images:", error);
      return [];
    }
    
    return data ? data.map(item => item.name) : [];
  } catch (error) {
    console.error("Error accessing storage:", error);
    return [];
  }
};

/**
 * Get the standard filename format for a player image
 */
export const getPlayerImageFilename = (playerId: string, fileExtension: string = 'webp'): string => {
  return `playerid${playerId}.${fileExtension}`;
};

/**
 * Force reload an image by creating a new URL with a timestamp
 */
export const forceImageReload = (imageUrl: string | null): string | null => {
  if (!imageUrl) return null;
  
  // For blob URLs, we can't add a cache buster
  if (imageUrl.startsWith('blob:')) {
    return imageUrl;
  }
  
  // Remove any existing parameters
  const baseUrl = imageUrl.split('?')[0];
  
  // Add a new cache buster timestamp
  return `${baseUrl}?t=${Date.now()}`;
};
