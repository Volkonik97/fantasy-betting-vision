
import { supabase } from "@/integrations/supabase/client";
import { BUCKET_NAME } from './constants';
import { getTeamLogoFromCache, cacheTeamLogo } from './images/logoCache';

/**
 * Get the public URL for a team logo by team ID
 * @param teamId The team ID
 * @returns Public URL for the team logo
 */
export const getTeamLogoUrl = async (teamId: string): Promise<string | null> => {
  if (!teamId) return null;
  
  // Check cache first
  const cachedUrl = getTeamLogoFromCache(teamId);
  if (cachedUrl !== undefined) {
    console.log(`Using cached logo for team ${teamId}: ${cachedUrl ? 'found' : 'not available'}`);
    return cachedUrl;
  }
  
  try {
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
        const { data: { publicUrl } } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(fileName);
        
        // Cache the result
        cacheTeamLogo(teamId, publicUrl);
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
      cacheTeamLogo(teamId, null);
      return null;
    }
    
    // Find any file that starts with the teamId
    const logoFile = files.find(file => file.name.toLowerCase().startsWith(teamId.toLowerCase()));
    
    if (logoFile) {
      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(logoFile.name);
      
      // Cache the result
      cacheTeamLogo(teamId, publicUrl);
      return publicUrl;
    }
    
    // Cache the negative result
    cacheTeamLogo(teamId, null);
    return null;
    
  } catch (error) {
    console.error("Error getting team logo URL:", error);
    // Cache the error result
    cacheTeamLogo(teamId, null);
    return null;
  }
};
