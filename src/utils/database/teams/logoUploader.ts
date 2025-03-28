
// This file implements the uploadTeamLogo function

import { supabase } from "@/integrations/supabase/client";
import { BUCKET_NAME } from './constants';

/**
 * Upload a team logo to Supabase storage
 * @param teamId The team ID
 * @param file The logo file
 * @returns Public URL for the uploaded logo
 */
export const uploadTeamLogo = async (teamId: string, file: File): Promise<string | null> => {
  if (!teamId || !file) {
    console.error("Missing required parameters for uploadTeamLogo");
    return null;
  }
  
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${teamId}.${fileExt}`;
    
    console.log(`Uploading logo for team ${teamId} with filename ${fileName}`);
    
    // Upload the file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (uploadError) {
      console.error("Error uploading team logo:", uploadError);
      return null;
    }
    
    // Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabase
      .storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);
    
    console.log(`Logo uploaded successfully for team ${teamId}, URL: ${publicUrl}`);
    return publicUrl;
  } catch (error) {
    console.error("Unexpected error uploading team logo:", error);
    return null;
  }
};
