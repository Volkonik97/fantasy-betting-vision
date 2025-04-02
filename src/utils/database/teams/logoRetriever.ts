
import { supabase } from "@/integrations/supabase/client";
import { BUCKET_NAME } from './constants';

/**
 * Get the public URL for a team logo by team ID - Version simplifiée
 * @param teamId The team ID
 * @returns Public URL for the team logo
 */
export const getTeamLogoUrl = async (teamId: string): Promise<string | null> => {
  if (!teamId) return null;
  
  try {
    // Vérifier s'il existe un fichier avec l'ID de l'équipe
    const formats = ['png', 'jpg', 'jpeg'];
    
    for (const format of formats) {
      const fileName = `${teamId}.${format}`;
      
      // Obtenir directement l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(fileName);
      
      // Vérifier si l'URL est valide
      const checkResponse = await fetch(publicUrl, { method: 'HEAD' });
      if (checkResponse.ok) {
        return publicUrl;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error getting team logo URL:", error);
    return null;
  }
};
