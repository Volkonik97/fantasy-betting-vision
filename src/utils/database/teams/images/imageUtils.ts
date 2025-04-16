
import { supabase } from "@/integrations/supabase/client";

/**
 * Normalize an image URL to ensure it's usable
 */
export const normalizeImageUrl = (imageUrl: string | null | undefined): string | null => {
  if (!imageUrl) return null;
  
  // Clean up the URL by trimming whitespace
  const cleanUrl = imageUrl.trim();
  
  // Add cache busting parameter to force refresh
  const cacheBuster = `?t=${Date.now()}`;
  
  // If it's already a complete Supabase Storage URL, return it with cache buster
  if (cleanUrl.includes('supabase.co/storage')) {
    // Fix any double slashes in URLs except for https://
    const fixedUrl = cleanUrl.replace(/([^:])\/\//g, '$1/');
    return fixedUrl + cacheBuster;
  }
  
  // If it's an absolute URL, return it as is with cache buster
  if (cleanUrl.startsWith('http')) {
    return cleanUrl + cacheBuster;
  }
  
  // If it's a path to the public folder, add leading slash if needed
  if (cleanUrl.startsWith('lovable-uploads/')) {
    return `/${cleanUrl}${cacheBuster}`;
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
      
    return data.publicUrl + cacheBuster;
  } catch (error) {
    console.error("Error creating URL from player ID:", error);
    return null;
  }
};

/**
 * Check if a player has a valid image
 */
export const hasPlayerImage = (imageUrl: string | null | undefined): boolean => {
  return !!imageUrl;
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
