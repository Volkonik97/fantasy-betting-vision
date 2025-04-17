
import { supabase } from "@/integrations/supabase/client";

/**
 * Get a direct image URL for a player from Supabase storage
 * This function is optimized to consistently return the same format URL
 * for reliable image loading
 */
export const getDirectPlayerImageUrl = (playerId: string | undefined | null): string | null => {
  if (!playerId) return null;
  
  try {
    // Clean player ID to ensure consistency
    const cleanId = playerId.replace(/[^a-zA-Z0-9-_]/g, '');
    
    // Use consistent filename format with .png extension
    // Instead of using date-based filenames, we use a standard format for better caching
    const fileName = `playerid${cleanId}.png`;
    
    // Get public URL from Supabase
    const { data: { publicUrl } } = supabase
      .storage
      .from('player-images')
      .getPublicUrl(fileName);
    
    // Add cache buster
    const timestamp = Date.now();
    const urlWithCacheBuster = `${publicUrl}?t=${timestamp}`;
    
    return urlWithCacheBuster;
  } catch (error) {
    console.error("Error generating direct image URL:", error);
    return null;
  }
};

/**
 * Check if a player ID has an image in storage
 */
export const checkPlayerImageExists = async (playerId: string | undefined | null): Promise<boolean> => {
  if (!playerId) return false;
  
  try {
    // Clean player ID
    const cleanId = playerId.replace(/[^a-zA-Z0-9-_]/g, '');
    
    // Use consistent filename format
    const fileName = `playerid${cleanId}.png`;
    
    // Check if file exists
    const { data, error } = await supabase
      .storage
      .from('player-images')
      .download(fileName);
    
    return !error && data !== null;
  } catch (error) {
    console.error("Error checking if player image exists:", error);
    return false;
  }
};

/**
 * Update a URL with a new cache buster
 */
export const refreshImageUrl = (url: string | null): string | null => {
  if (!url) return null;
  
  try {
    const baseUrl = url.split('?')[0];
    return `${baseUrl}?t=${Date.now()}`;
  } catch (error) {
    return url;
  }
};
