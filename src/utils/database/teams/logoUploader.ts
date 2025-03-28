
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const BUCKET_NAME = "team-logos";

/**
 * Upload a team logo to Supabase storage
 * @param teamId Team ID to use as the file name
 * @param logoFile The logo file to upload
 * @returns URL of the uploaded logo or null if error
 */
export const uploadTeamLogo = async (teamId: string, logoFile: File): Promise<string | null> => {
  try {
    if (!teamId || !logoFile) {
      console.error("Missing required parameters for logo upload");
      return null;
    }
    
    // Generate a file path for the logo - using the team ID as filename
    const fileExt = logoFile.name.split('.').pop();
    const filePath = `${teamId}.${fileExt}`;
    
    console.log(`Uploading logo for team ${teamId} to ${BUCKET_NAME}/${filePath}`);
    
    // Upload the file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, logoFile, {
        upsert: true, // Overwrite if exists
        contentType: logoFile.type
      });
    
    if (uploadError) {
      console.error("Error uploading team logo:", uploadError);
      toast.error("Échec du téléchargement du logo de l'équipe");
      return null;
    }
    
    // Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);
    
    console.log(`Logo uploaded successfully. Public URL: ${publicUrl}`);
    return publicUrl;
  } catch (error) {
    console.error("Error uploading team logo:", error);
    toast.error("Erreur lors du téléchargement du logo");
    return null;
  }
};

/**
 * Get the public URL for a team logo by team ID
 * @param teamId The team ID
 * @returns Public URL for the team logo
 */
export const getTeamLogoUrl = async (teamId: string): Promise<string | null> => {
  if (!teamId) return null;
  
  // We don't know the file extension, so we check if the file exists with common formats
  const formats = ['png', 'jpg', 'jpeg', 'svg', 'webp'];
  
  try {
    // List all files in the bucket that start with the teamId
    const { data, error } = await supabase
      .storage
      .from(BUCKET_NAME)
      .list('', {
        limit: 100,
        search: teamId,
      });
    
    if (error) {
      console.error("Error checking for team logo:", error);
      return null;
    }

    // Find any file that starts with the teamId
    const logoFile = data.find(file => file.name.startsWith(teamId + '.'));
    
    if (logoFile) {
      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(logoFile.name);
      
      return publicUrl;
    }
    
    // If we can't find the file directly, try with different formats
    for (const format of formats) {
      const filePath = `${teamId}.${format}`;
      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);
      
      return publicUrl;
    }
  } catch (error) {
    console.error("Error getting team logo URL:", error);
  }
  
  return null;
};

/**
 * Find a team by its name (case-insensitive)
 * @param teams List of all teams
 * @param filename Filename (assumed to be team name)
 * @returns Team ID if found, null otherwise
 */
export const findTeamByName = (teams: { id: string, name: string }[], filename: string): string | null => {
  // Normalize the filename and remove extension
  const normalizedName = filename.split('.')[0].toLowerCase().trim()
    .replace(/_/g, ' ')  // Replace underscores with spaces
    .replace(/-/g, ' '); // Replace hyphens with spaces
  
  // First, try exact match with team name
  const exactMatch = teams.find(team => 
    team.name.toLowerCase() === normalizedName
  );
  
  if (exactMatch) return exactMatch.id;
  
  // Try with more flexible matching - split words and check
  const filenameWords = normalizedName.split(' ').filter(word => word.length > 1);
  
  // If no exact match, try finding partial matches
  const partialMatches = teams.filter(team => {
    const teamName = team.name.toLowerCase();
    
    // Simple inclusion check
    if (teamName.includes(normalizedName) || normalizedName.includes(teamName)) {
      return true;
    }
    
    // Word by word match - team name contains most of the words in filename
    const teamWords = teamName.split(' ');
    const matchedWords = filenameWords.filter(word => 
      teamWords.some(teamWord => teamWord.includes(word) || word.includes(teamWord))
    );
    
    // If more than half of the words match, consider it a match
    return matchedWords.length > 0 && 
           matchedWords.length >= Math.max(1, Math.floor(filenameWords.length / 2));
  });
  
  if (partialMatches.length === 1) {
    // If we have exactly one partial match, use it
    return partialMatches[0].id;
  } else if (partialMatches.length > 1) {
    // Multiple matches, use the closest one by string similarity
    partialMatches.sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      
      // Simple similarity metric: compare word coverage
      const aWordMatches = filenameWords.filter(word => 
        aName.split(' ').some(nameWord => nameWord.includes(word) || word.includes(nameWord))
      ).length;
      
      const bWordMatches = filenameWords.filter(word => 
        bName.split(' ').some(nameWord => nameWord.includes(word) || word.includes(nameWord))
      ).length;
      
      // If word matches are different, use that
      if (aWordMatches !== bWordMatches) {
        return bWordMatches - aWordMatches; // Higher match count first
      }
      
      // If same number of word matches, use length difference as tiebreaker
      const aDiff = Math.abs(aName.length - normalizedName.length);
      const bDiff = Math.abs(bName.length - normalizedName.length);
      return aDiff - bDiff;
    });
    
    return partialMatches[0].id;
  }
  
  // Try to match by ID as a fallback
  const idMatch = teams.find(team => 
    team.id.toLowerCase() === normalizedName.replace(' ', '')
  );
  
  if (idMatch) return idMatch.id;
  
  // If all else fails, try more aggressive matching by looking for keyword presence
  const keywordMatch = teams.find(team => {
    const teamName = team.name.toLowerCase();
    // Check if any substantial word from the filename (3+ chars) is in the team name
    return filenameWords
      .filter(word => word.length >= 3)
      .some(word => teamName.includes(word));
  });
  
  return keywordMatch ? keywordMatch.id : null;
};
