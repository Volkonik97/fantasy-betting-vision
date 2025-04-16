
import { supabase } from "@/integrations/supabase/client";

/**
 * Check if an image URL is accessible in the Supabase storage
 * @param imageUrl The full URL of the image to check
 * @returns Boolean indicating if the image is accessible
 */
export const verifyImageExists = async (imageUrl: string): Promise<boolean> => {
  if (!imageUrl) return false;
  
  try {
    console.log(`Verifying image URL: ${imageUrl}`);
    
    // For internal application URLs (lovable-uploads)
    if (imageUrl.includes('/lovable-uploads/')) {
      console.log(`Image is in lovable-uploads: ${imageUrl}`);
      return true; // These images are in the public folder
    }
    
    // For absolute external URLs (not Supabase storage)
    if (imageUrl.startsWith('http') && !imageUrl.includes('supabase.co/storage')) {
      console.log(`External image URL: ${imageUrl}`);
      
      // Attempt to fetch the image to verify it exists
      try {
        const response = await fetch(imageUrl, { method: 'HEAD' });
        const exists = response.ok;
        console.log(`External image exists: ${exists}`);
        return exists;
      } catch (error) {
        console.error(`Error checking external image: ${error}`);
        return false;
      }
    }
    
    // For direct storage.supabase.co URLs from player-images bucket
    if (imageUrl.includes('storage.supabase.co') && imageUrl.includes('player-images')) {
      console.log(`Direct storage URL from player-images: ${imageUrl}`);
      
      // Extract the file path from the URL
      let filePath = '';
      const regex = /player-images\/(.+)$/;
      const match = imageUrl.match(regex);
      
      if (match && match[1]) {
        filePath = match[1];
        console.log(`Extracted file path: ${filePath}`);
        
        // Check if the file exists in the player-images bucket
        const { data, error } = await supabase
          .storage
          .from('player-images')
          .download(filePath);
        
        if (error) {
          console.error(`File not found in player-images bucket: ${error.message}`);
          return false;
        }
        
        console.log(`File exists in player-images bucket`);
        return true;
      } else {
        console.error(`Could not extract file path from URL: ${imageUrl}`);
        return false;
      }
    }
    
    // For simple filenames - check directly in player-images bucket
    if (!imageUrl.includes('/') && !imageUrl.startsWith('http')) {
      console.log(`Checking simple filename in player-images bucket: ${imageUrl}`);
      
      const { data, error } = await supabase
        .storage
        .from('player-images')
        .download(imageUrl);
      
      if (error) {
        console.error(`File not found in player-images bucket: ${error.message}`);
        return false;
      }
      
      console.log(`File exists in player-images bucket`);
      return true;
    }
    
    console.log(`Unknown image format, cannot verify: ${imageUrl}`);
    return false;
  } catch (error) {
    console.error("Error verifying image:", error);
    return false;
  }
};
