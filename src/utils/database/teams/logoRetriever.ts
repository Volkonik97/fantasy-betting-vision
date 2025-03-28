
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
    // Special handling for Team Valiant - use the hardcoded logo path
    if (teamId === TEAM_VALIANT_ID || teamId.toLowerCase().includes("valiant")) {
      console.log("Team Valiant detected - using hardcoded logo path");
      return VALIANT_LOGO_PATH;
    }
    
    // Standard processing for all other teams
    const { data: files, error } = await supabase
      .storage
      .from(BUCKET_NAME)
      .list();
    
    if (error) {
      console.error("Error listing team logos:", error);
      return null;
    }
    
    // Find any file that starts with the teamId
    const logoFile = files.find(file => file.name.startsWith(teamId));
    
    if (logoFile) {
      console.log(`Found logo file for team ${teamId}: ${logoFile.name}`);
      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(logoFile.name);
      
      return publicUrl;
    }
    
    // If no file found, try with common extensions
    const formats = ['png', 'jpg', 'jpeg', 'svg', 'webp'];
    for (const format of formats) {
      const filePath = `${teamId}.${format}`;
      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);
      
      // This will return a URL regardless of whether the file exists
      return publicUrl;
    }
  } catch (error) {
    console.error("Error getting team logo URL:", error);
  }
  
  return null;
};
