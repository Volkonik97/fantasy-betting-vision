
import { supabase } from "@/integrations/supabase/client";
import { BUCKET_NAME } from './constants';

/**
 * Get the public URL for a team logo by team ID
 * @param teamId The team ID
 * @returns Public URL for the team logo
 */
export const getTeamLogoUrl = async (teamId: string): Promise<string | null> => {
  if (!teamId) return null;
  
  try {
    // Get and return the public URL
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(`${teamId}.png`);
    
    console.log(`Logo URL for team ${teamId}: ${publicUrl}`);
    return publicUrl;
  } catch (error) {
    console.error("Error getting team logo URL:", error);
    return null;
  }
};
