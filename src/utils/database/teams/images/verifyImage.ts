
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
      return true; // We assume external URLs are valid
    }
    
    // Check for direct storage.supabase.co URLs - these are valid public URLs
    if (imageUrl.includes('storage.supabase.co')) {
      console.log(`Direct storage.supabase.co URL: ${imageUrl}`);
      return true;
    }
    
    // For relative paths
    if (!imageUrl.startsWith('http')) {
      console.log(`Relative image path: ${imageUrl}`);
      return true; // Relative paths should be valid
    }
    
    // For player-images bucket URLs, specifically check if the file exists
    if (imageUrl.includes('player-images')) {
      console.log(`Checking player-images URL: ${imageUrl}`);
      
      // Extract the file path from the URL
      // Example URL: https://dtddoxxazhmfudrvpszu.supabase.co/storage/v1/object/public/player-images/filename.jpg
      const filePathMatch = imageUrl.match(/player-images\/(.+)$/);
      if (filePathMatch && filePathMatch[1]) {
        const filePath = filePathMatch[1];
        console.log(`Checking if file exists in player-images bucket: ${filePath}`);
        
        const { data, error } = await supabase
          .storage
          .from('player-images')
          .download(filePath);
          
        if (error) {
          console.error(`Error checking file in player-images bucket: ${error.message}`);
          return false;
        }
        
        console.log(`File exists in player-images bucket: ${filePath}`);
        return true;
      }
    }
    
    // If it's any other Supabase URL, assume it's valid
    console.log(`Assuming Supabase storage URL is valid: ${imageUrl}`);
    return true;
  } catch (error) {
    console.error("Error verifying image:", error);
    return false;
  }
};
