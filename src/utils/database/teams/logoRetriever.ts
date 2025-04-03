
import { supabase } from "@/integrations/supabase/client";
import { BUCKET_NAME, TEAM_VALIANT_ID, VALIANT_LOGO_PATH } from './constants';

/**
 * Get the public URL for a team logo by team ID
 * @param teamId The team ID
 * @returns Public URL for the team logo
 */
export const getTeamLogoUrl = async (teamId: string): Promise<string | null> => {
  if (!teamId) return null;
  
  try {
    // Handle known problematic logos with direct fallbacks
    if (teamId === TEAM_VALIANT_ID || teamId.toLowerCase().includes("valiant")) {
      console.log("Team Valiant detected - using hardcoded logo path");
      return VALIANT_LOGO_PATH;
    }
    
    // Special case for Gen.G which often has issues - use directly uploaded image
    if (teamId === "GENG" || teamId.toLowerCase() === "geng" || teamId.toLowerCase().includes("gen.g")) {
      console.log("Gen.G detected - using uploaded logo path");
      return "/lovable-uploads/8e2289d0-fe11-463b-a9fc-8116d67f7a15.png";
    }
    
    // First, try to get the file directly using the team ID and common extensions
    const formats = ['png', 'jpg', 'jpeg', 'svg', 'webp'];
    
    for (const format of formats) {
      const fileName = `${teamId}.${format}`;
      
      // Check if this specific file exists
      const { data: fileExists, error: checkError } = await supabase
        .storage
        .from(BUCKET_NAME)
        .list('', {
          search: fileName
        });
      
      if (checkError) {
        console.error(`Error checking for file ${fileName}:`, checkError);
        continue;
      }
      
      // If we found the file
      if (fileExists && fileExists.some(f => f.name === fileName)) {
        console.log(`Found exact match file for team ${teamId}: ${fileName}`);
        const { data: { publicUrl } } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(fileName);
        
        return publicUrl;
      }
    }
    
    // If no exact match found, list all files and find one that starts with the teamId
    const { data: files, error } = await supabase
      .storage
      .from(BUCKET_NAME)
      .list();
    
    if (error) {
      console.error("Error listing team logos:", error);
      return null;
    }
    
    // Find any file that starts with the teamId
    const logoFile = files.find(file => file.name.toLowerCase().startsWith(teamId.toLowerCase()));
    
    if (logoFile) {
      console.log(`Found logo file for team ${teamId}: ${logoFile.name}`);
      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(logoFile.name);
      
      return publicUrl;
    }
    
    console.log(`No logo found for team ${teamId} after checking all methods`);
    return null;
    
  } catch (error) {
    console.error("Error getting team logo URL:", error);
    return null;
  }
};
