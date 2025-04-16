
import { supabase } from "@/integrations/supabase/client";

/**
 * Check if an image URL is accessible in the Supabase storage or as an external URL
 * @param imageUrl The full URL of the image to check
 * @returns Boolean indicating if the image is accessible
 */
export const verifyImageExists = async (imageUrl: string): Promise<boolean> => {
  if (!imageUrl) return false;
  
  try {
    console.log(`Verifying image URL: ${imageUrl}`);
    
    // For images in public folder (lovable-uploads)
    if (imageUrl.includes('/lovable-uploads/')) {
      console.log(`Image in lovable-uploads: ${imageUrl}`);
      return true; // These images are in the public folder
    }
    
    // For absolute external URLs (non-Supabase storage)
    if (imageUrl.startsWith('http') && !imageUrl.includes('supabase.co/storage')) {
      console.log(`External image URL: ${imageUrl}`);
      
      try {
        const response = await fetch(imageUrl, { 
          method: 'HEAD',
          // Add timeout to avoid long waits
          signal: AbortSignal.timeout(5000)
        });
        const exists = response.ok;
        console.log(`External image accessible: ${exists}`);
        return exists;
      } catch (error) {
        console.error(`Error checking external image: ${error}`);
        return false;
      }
    }
    
    // For Supabase URLs
    if (imageUrl.includes('supabase.co/storage')) {
      console.log(`Supabase storage URL: ${imageUrl}`);
      
      // Extract the bucket name and path from the URL
      const storagePathRegex = /storage\/v1\/object\/public\/([^\/]+)\/(.+?)(\?.*)?$/;
      const matches = imageUrl.match(storagePathRegex);
      
      if (matches && matches.length >= 3) {
        const bucketName = matches[1];
        const filePath = decodeURIComponent(matches[2]);
        
        console.log(`Extracted bucket: ${bucketName}, path: ${filePath}`);
        
        // Check if file exists in the bucket
        try {
          const { data, error } = await supabase
            .storage
            .from(bucketName)
            .download(filePath);
          
          if (error) {
            console.error(`File not found in bucket ${bucketName}: ${error.message}`);
            return false;
          }
          
          console.log(`File exists in bucket ${bucketName}`);
          return true;
        } catch (storageError) {
          console.error(`Error accessing storage: ${storageError}`);
          return false;
        }
      } else {
        console.error(`Could not extract path from URL: ${imageUrl}`);
        return false;
      }
    }
    
    // For simple filenames - check directly in the 'player-images' bucket
    if (!imageUrl.includes('/') && !imageUrl.startsWith('http')) {
      console.log(`Checking simple filename in player-images bucket: ${imageUrl}`);
      
      try {
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
      } catch (storageError) {
        console.error(`Error accessing storage: ${storageError}`);
        return false;
      }
    }
    
    // For playerid-based filenames
    const playerIdMatch = imageUrl.match(/playerid([^\.]+)/);
    if (playerIdMatch) {
      console.log(`Checking playerid-based filename: ${imageUrl}`);
      
      // List all files in the bucket to find matching ones
      const { data: files, error: listError } = await supabase
        .storage
        .from('player-images')
        .list('');
        
      if (listError) {
        console.error(`Error listing files: ${listError.message}`);
        return false;
      }
      
      if (files) {
        // Check if any file matches the playerid pattern
        const playerIdValue = playerIdMatch[1];
        const matchingFile = files.find(file => 
          file.name.includes(`playerid${playerIdValue}`)
        );
        
        if (matchingFile) {
          console.log(`Found matching file in bucket: ${matchingFile.name}`);
          return true;
        }
      }
      
      console.log(`No matching playerid file found`);
      return false;
    }
    
    console.log(`Unknown image format, cannot verify: ${imageUrl}`);
    return false;
  } catch (error) {
    console.error("Error verifying image:", error);
    return false;
  }
};
