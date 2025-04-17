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
  
  // If it's a path to the public folder, add leading slash if needed
  if (cleanUrl.startsWith('lovable-uploads/')) {
    const urlWithoutParams = cleanUrl.split('?')[0];
    const cacheBuster = `?t=${Date.now()}`;
    return `/${urlWithoutParams}${cacheBuster}`;
  }
  
  // Return the URL as-is if we can't determine the format
  return cleanUrl;
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
    // Check first if a file with exact name exists
    const fileName = `playerid${playerId}`;
    
    // Try to get the file info from storage
    const { data: fileData, error: fileError } = await supabase
      .storage
      .from('player-images')
      .list('', {
        search: fileName,
        limit: 1
      });
    
    if (fileError) {
      console.error("Error checking exact player image:", fileError);
      return false;
    }
    
    if (fileData && fileData.length > 0) {
      console.log(`Found exact image match for player ${playerId}: ${fileData[0].name}`);
      return true;
    }
    
    // No exact match found, check with wildcard search
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
 * Try all possible methods to verify an image exists
 */
export const verifyImageAccessibleWithRetry = async (imageUrl: string): Promise<boolean> => {
  if (!imageUrl) return false;
  
  console.log(`Verifying image accessibility for URL: ${imageUrl}`);
  
  // For blob URLs, assume they're accessible since they're in memory
  if (imageUrl.startsWith('blob:')) {
    return true;
  }
  
  // For Supabase storage URLs
  if (imageUrl.includes('supabase.co/storage')) {
    try {
      // Extract the bucket and path
      const storageUrlPattern = /storage\/v1\/object\/public\/([^\/]+)\/(.+?)(\?.*)?$/;
      const matches = imageUrl.match(storageUrlPattern);
      
      if (matches && matches.length >= 3) {
        const bucket = matches[1];
        let path = matches[2];
        
        // Remove any URL encoding
        path = decodeURIComponent(path);
        
        console.log(`Checking Supabase storage: bucket=${bucket}, path=${path}`);
        
        // Check for player ID pattern
        if (path.startsWith('playerid')) {
          // Extract the player ID without file extension
          const playerIdWithExt = path;
          const playerId = playerIdWithExt.split('.')[0];
          
          // Try with different extensions
          const { data: listData, error: listError } = await supabase
            .storage
            .from(bucket)
            .list('', {
              search: playerId,
              sortBy: { column: 'name', order: 'asc' }
            });
            
          if (listError) {
            console.error(`List verification error: ${listError.message}`);
          } else if (listData && listData.length > 0) {
            console.log(`Files found matching prefix: ${listData.map(f => f.name).join(', ')}`);
            return true;
          }
        }
        
        // Try direct download with various extensions if we're dealing with a playerid file
        if (path.startsWith('playerid')) {
          const baseFilename = path.split('.')[0];
          const extensions = ['.png', '.jpg', '.jpeg', '.webp'];
          
          for (const ext of extensions) {
            try {
              const { data, error } = await supabase
                .storage
                .from(bucket)
                .download(`${baseFilename}${ext}`);
              
              if (!error && data) {
                console.log(`File exists with extension ${ext}: ${baseFilename}${ext}`);
                return true;
              }
            } catch (e) {
              // Continue trying other extensions
            }
          }
        } else {
          // Direct download attempt for non-playerid files
          const { data, error } = await supabase
            .storage
            .from(bucket)
            .download(path);
          
          if (error) {
            console.error(`Download verification error: ${error.message}`);
          } else if (data) {
            console.log(`File exists and is downloadable from bucket ${bucket}`);
            return true;
          }
        }
      }
    } catch (error) {
      console.error("Error verifying Supabase image:", error);
    }
  }
  
  // Fallback to direct HTTP fetch verification for all URLs
  try {
    const fetchUrl = imageUrl.includes('?') ? imageUrl : `${imageUrl}?t=${Date.now()}`;
    
    console.log(`Fetching image with HEAD request: ${fetchUrl}`);
    
    const response = await fetch(fetchUrl, { 
      method: 'HEAD',
      headers: { "Cache-Control": "no-cache" },
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
    
    console.log(`Image fetch response: ${response.status} ${response.statusText}`);
    
    return response.ok;
  } catch (error) {
    console.error("Error verifying image with fetch:", error);
    return false;
  }
};
