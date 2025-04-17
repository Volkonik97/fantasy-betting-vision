import { supabase } from "@/utils/supabaseClient";

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

    const { data, error } = supabase.storage.from(BUCKET).getPublicUrl(path);

    if (data?.publicUrl && !error) {
      return data.publicUrl;
    }
  }

  console.warn(`Aucun logo trouvé pour l'équipe ${teamId}`);
  return null;
}
