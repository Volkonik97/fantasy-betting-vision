
import { supabase } from "@/integrations/supabase/client";

const BUCKET = "team-logos"; // Nom de ton bucket Supabase Storage
const FOLDER = ""; // Ajoute ici un sous-dossier si les logos sont dans un répertoire (ex: "logos")

/**
 * Essaie de générer une URL publique pour un logo d'équipe basé sur l'ID.
 * Priorité au format .webp, puis fallback sur .png
 * @param teamId ID unique de l'équipe (correspond au nom du fichier dans Supabase Storage)
 * @returns URL publique du logo ou null si introuvable
 */
export async function getTeamLogoUrl(teamId: string): Promise<string | null> {
  if (!teamId) return null;

  // Essaye d'abord avec .webp
  const formats = ["webp", "png"];

  for (const ext of formats) {
    const path = `${FOLDER ? `${FOLDER}/` : ""}${teamId}.${ext}`;

    // Supabase v2 getPublicUrl doesn't return error property directly
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);

    if (data?.publicUrl) {
      return data.publicUrl;
    }
  }

  console.warn(`Aucun logo trouvé pour l'équipe ${teamId}`);
  return null;
}

// Re-export functions from logoUploader.ts to fix missing exports
export { uploadTeamLogo } from './logoUploader';

/**
 * Find team by name in teams list
 * @param teams List of teams
 * @param filename Filename to match with team name
 * @returns Team ID if found, null otherwise
 */
export function findTeamByName(teams: any[], filename: string): string | null {
  if (!teams || !teams.length || !filename) return null;
  
  // Clean filename by removing extension
  const cleanName = filename.split('.')[0].toLowerCase();
  
  // Try to find exact match first
  const exactMatch = teams.find(team => 
    team.name.toLowerCase() === cleanName ||
    team.id.toLowerCase() === cleanName
  );
  
  if (exactMatch) return exactMatch.id;
  
  // Then try partial match
  const partialMatch = teams.find(team => 
    team.name.toLowerCase().includes(cleanName) || 
    cleanName.includes(team.name.toLowerCase())
  );
  
  return partialMatch ? partialMatch.id : null;
}
