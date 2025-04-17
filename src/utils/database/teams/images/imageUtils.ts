
import { supabase } from "@/integrations/supabase/client";
import { getDirectPlayerImageUrl } from "@/utils/database/teams/getDirectImageUrl";

/**
 * Normalize an image URL to ensure it's usable
 */
export const normalizeImageUrl = (imageUrl: string | null | undefined): string | null => {
  if (!imageUrl) return null;
  
  // Clean up the URL by trimming whitespace
  const cleanUrl = imageUrl.trim();
  
  // Special case for blob URLs (file previews) - return as is
  if (cleanUrl.startsWith('blob:')) {
    return cleanUrl;
  }
  
  // For playerid strings, use the direct URL generator
  if (cleanUrl.includes('playerid')) {
    const playerIdMatch = cleanUrl.match(/playerid([^\.]+)/);
    if (playerIdMatch && playerIdMatch[1]) {
      return getDirectPlayerImageUrl(playerIdMatch[1]);
    }
  }
  
  // If it's already a complete Supabase Storage URL, add cache buster
  if (cleanUrl.includes('supabase.co/storage')) {
    // Fix any double slashes in URLs except for https://
    const fixedUrl = cleanUrl.replace(/([^:])\/\//g, '$1/');
    
    // Remove any existing cache buster parameter
    const urlWithoutParams = fixedUrl.split('?')[0];
    
    // Add a new cache buster parameter
    const cacheBuster = `?t=${Date.now()}`;
    return urlWithoutParams + cacheBuster;
  }
  
  // If it's an absolute URL, add cache buster
  if (cleanUrl.startsWith('http')) {
    // Remove any existing cache buster parameter
    const urlWithoutParams = cleanUrl.split('?')[0];
    
    // Add a new cache buster parameter
    const cacheBuster = `?t=${Date.now()}`;
    return urlWithoutParams + cacheBuster;
  }
  
  // If it's a player ID (without the 'playerid' prefix)
  if (/^[a-zA-Z0-9-_]+$/.test(cleanUrl)) {
    return getDirectPlayerImageUrl(cleanUrl);
  }
  
  // Return the URL as-is if we can't determine the format
  return cleanUrl;
};

/**
 * Check if a player has a valid image
 */
export const hasPlayerImage = (player: { image?: string | null } | null | undefined): boolean => {
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
 * Force reload an image by creating a new URL with a timestamp
 */
export const forceImageReload = (imageUrl: string | null): string | null => {
  if (!imageUrl) return null;
  
  // For blob URLs, we can't add a cache buster
  if (imageUrl.startsWith('blob:')) {
    return imageUrl;
  }
  
  // For playerid strings, use the direct URL generator
  if (imageUrl.includes('playerid')) {
    const playerIdMatch = imageUrl.match(/playerid([^\.]+)/);
    if (playerIdMatch && playerIdMatch[1]) {
      return getDirectPlayerImageUrl(playerIdMatch[1]);
    }
  }
  
  // Remove any existing parameters
  const baseUrl = imageUrl.split('?')[0];
  
  // Add a new cache buster timestamp
  const timestamp = Date.now();
  return `${baseUrl}?t=${timestamp}`;
};

/**
 * Verify if an image is accessible with retry
 */
export const verifyImageAccessibleWithRetry = async (imageUrl: string): Promise<boolean> => {
  if (!imageUrl) return false;
  
  // For blob URLs, assume they're accessible
  if (imageUrl.startsWith('blob:')) return true;
  
  // Try a few times with different extensions
  const extensions = ['.png', '.jpg', '.jpeg', '.webp'];
  
  // If URL already has a file extension, try that first
  const extensionMatch = imageUrl.match(/\.([a-zA-Z0-9]+)(\?|$)/);
  const currentExtension = extensionMatch ? `.${extensionMatch[1]}` : null;
  
  if (currentExtension) {
    try {
      const response = await fetch(imageUrl, { method: 'HEAD' });
      if (response.ok) return true;
    } catch (error) {
      // Ignore fetch errors and try other extensions
    }
  }
  
  // Try other extensions if current one failed
  for (const ext of extensions) {
    if (ext === currentExtension) continue;
    
    try {
      // Replace current extension with new one
      const newUrl = currentExtension 
        ? imageUrl.replace(currentExtension, ext) 
        : `${imageUrl.split('?')[0]}${ext}`;
      
      const response = await fetch(newUrl, { method: 'HEAD' });
      if (response.ok) return true;
    } catch (error) {
      // Ignore and try next extension
    }
  }
  
  return false;
};
