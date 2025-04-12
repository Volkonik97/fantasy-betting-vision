
import { supabase } from "@/integrations/supabase/client";

/**
 * Check if an image URL is accessible in the Supabase storage
 * @param imageUrl The full URL of the image to check
 * @returns Boolean indicating if the image is accessible
 */
export const verifyImageExists = async (imageUrl: string): Promise<boolean> => {
  if (!imageUrl) return false;
  
  try {
    // For external URLs (not Supabase storage), just return true
    if (!imageUrl.includes('supabase.co/storage')) {
      return true;
    }
    
    // Extract bucket name and path from the URL
    // Example URL format: https://{project-ref}.supabase.co/storage/v1/object/public/{bucket}/{path}
    const urlParts = imageUrl.split('/storage/v1/object/public/');
    if (urlParts.length !== 2) {
      console.warn(`Invalid image URL format: ${imageUrl}`);
      return false;
    }
    
    const pathParts = urlParts[1].split('/');
    if (pathParts.length < 2) {
      console.warn(`Not enough path parts in URL: ${imageUrl}`);
      return false;
    }
    
    const bucket = pathParts[0];
    const path = pathParts.slice(1).join('/');
    
    if (!bucket || !path) {
      console.warn(`Missing bucket or path in URL: ${imageUrl}`);
      return false;
    }
    
    console.log(`Verifying image in bucket: ${bucket}, path: ${path}`);
    
    // Check if the object exists without downloading it
    const { data, error } = await supabase
      .storage
      .from(bucket)
      .createSignedUrl(path, 60); // Create a signed URL with 60 seconds expiry
    
    if (error) {
      console.error("Error checking image existence:", error);
      return false;
    }
    
    // If we successfully created a signed URL, the file exists
    return !!data;
  } catch (error) {
    console.error("Exception verifying image:", error);
    return false;
  }
};
