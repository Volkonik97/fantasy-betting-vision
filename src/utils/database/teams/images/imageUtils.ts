
// Re-export all image utility functions from the images module
import { verifyImageExists } from './verifyImage';
import { clearInvalidImageReference, clearAllPlayerImageReferences } from './clearImages';
import { refreshImageReferences, synchronizeReferences } from './refreshImages';
import { checkBucketRlsPermission } from './rlsPermissions';

// Normalize image URL to ensure consistent format
export const normalizeImageUrl = (imageUrl: string | null): string | null => {
  if (!imageUrl) return null;
  
  try {
    // For blob URLs, return as is
    if (imageUrl.startsWith('blob:')) {
      return imageUrl;
    }
    
    // For full URLs, ensure they have the correct protocol
    if (imageUrl.match(/^https?:\/\//i)) {
      return imageUrl;
    }
    
    // For relative URLs that are already storage URLs
    if (imageUrl.includes('supabase.co/storage')) {
      return imageUrl;
    }
    
    // For simple filenames with playerid prefix
    if (imageUrl.startsWith('playerid')) {
      return `https://nbioauymqggfafmsuigr.supabase.co/storage/v1/object/public/player-images/${imageUrl}`;
    }
    
    // For simple filenames without extension, assume it's a player ID
    if (!imageUrl.includes('/') && !imageUrl.includes('.')) {
      return `https://nbioauymqggfafmsuigr.supabase.co/storage/v1/object/public/player-images/playerid${imageUrl}.webp`;
    }
    
    // For other paths, assume they are relative to the player-images bucket
    return `https://nbioauymqggfafmsuigr.supabase.co/storage/v1/object/public/player-images/${imageUrl}`;
  } catch (error) {
    console.error("Error normalizing image URL:", error);
    return null;
  }
};

// Force image reload by adding a cache-buster timestamp
export const forceImageReload = (imageUrl: string): string => {
  try {
    const timestamp = Date.now();
    
    // If URL already has parameters, add timestamp as another parameter
    if (imageUrl.includes('?')) {
      return `${imageUrl}&t=${timestamp}`;
    }
    
    // Otherwise, add timestamp as the first parameter
    return `${imageUrl}?t=${timestamp}`;
  } catch (error) {
    console.error("Error adding cache-buster to URL:", error);
    return imageUrl;
  }
};

// Verify if an image is accessible with retries
export const verifyImageAccessibleWithRetry = async (
  imageUrl: string, 
  retries: number = 3, 
  delay: number = 1000
): Promise<boolean> => {
  if (!imageUrl) return false;
  
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(imageUrl, { 
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        return true;
      }
      
      // Wait before retry
      if (attempt < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    } catch (error) {
      console.warn(`Attempt ${attempt + 1} failed to verify image: ${imageUrl}`, error);
      
      // Wait before retry
      if (attempt < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  return false;
};

// Check if a player has an image
export const hasPlayerImage = (
  player: { image?: string | null } | null
): boolean => {
  if (!player || !player.image) {
    return false;
  }
  
  return Boolean(player.image);
};

export {
  verifyImageExists,
  clearInvalidImageReference,
  clearAllPlayerImageReferences,
  refreshImageReferences,
  synchronizeReferences,
  checkBucketRlsPermission
};
