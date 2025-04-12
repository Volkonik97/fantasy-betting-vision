
import { supabase } from "@/integrations/supabase/client";
import { BUCKET_NAME, TEAM_VALIANT_ID, VALIANT_LOGO_PATH, TEAM_GENG_ID, GENG_LOGO_PATH, TEAM_NICKNAME_MAP } from './constants';

/**
 * Get the public URL for a team logo by team ID
 * @param teamId The team ID
 * @returns Public URL for the team logo
 */
export const getTeamLogoUrl = async (teamId: string): Promise<string | null> => {
  if (!teamId) return null;
  
  try {
    // Cas particuliers avec fallbacks directs
    if (teamId === TEAM_VALIANT_ID || teamId.toLowerCase().includes("valiant")) {
      console.log("Team Valiant détectée - utilisation du chemin de logo codé en dur");
      return VALIANT_LOGO_PATH;
    }
    
    // Cas particulier pour Gen.G qui a souvent des problèmes - utiliser l'image téléchargée directement
    if (teamId === TEAM_GENG_ID || teamId.toLowerCase() === "geng" || teamId.toLowerCase().includes("gen.g")) {
      console.log("Gen.G détecté - utilisation du chemin de logo téléchargé");
      return GENG_LOGO_PATH;
    }
    
    // Cas particulier pour Cloud9
    if (teamId.toLowerCase().includes("cloud9") || teamId.toLowerCase() === "c9") {
      console.log("Cloud9 détecté - utilisation du logo spécifique");
      return "/lovable-uploads/61322944-83d9-4ad7-a676-44dc5d959bd6.png";
    }
    
    // Cas particulier pour Disguised
    if (teamId.toLowerCase().includes("disguised")) {
      console.log("Disguised détecté - utilisation du logo spécifique");
      return "/lovable-uploads/e1e0225a-15c3-4752-81a5-31b23ff17f11.png"; 
    }
    
    // Cas particulier pour FlyQuest
    if (teamId.toLowerCase().includes("flyquest") || teamId.toLowerCase() === "fly") {
      console.log("FlyQuest détecté - utilisation du logo spécifique");
      return "/lovable-uploads/e8ad379a-9beb-4829-9c74-75a074568549.png";
    }
    
    // Cas particulier pour Team Liquid
    if (teamId.toLowerCase().includes("liquid") || teamId.toLowerCase() === "tl") {
      console.log("Team Liquid détecté - utilisation du logo spécifique");
      return "/lovable-uploads/4d612b58-6777-485c-8fd7-6c23892150e7.png";
    }
    
    // Cas particulier pour PaiN Gaming
    if (teamId.toLowerCase().includes("pain") || teamId.toLowerCase().includes("paingaming")) {
      console.log("PaiN Gaming détecté - utilisation du logo spécifique");
      return "/lovable-uploads/d4a83519-9297-4ffc-890c-666b32b48c55.png";
    }
    
    // D'abord, essayer d'obtenir le fichier directement en utilisant l'ID d'équipe et les extensions courantes
    const formats = ['png', 'jpg', 'jpeg', 'svg', 'webp'];
    
    for (const format of formats) {
      const fileName = `${teamId}.${format}`;
      
      // Vérifier si ce fichier spécifique existe
      const { data: fileExists, error: checkError } = await supabase
        .storage
        .from(BUCKET_NAME)
        .list('', {
          search: fileName
        });
      
      if (checkError) {
        console.error(`Erreur lors de la vérification du fichier ${fileName}:`, checkError);
        continue;
      }
      
      // Si nous avons trouvé le fichier
      if (fileExists && fileExists.some(f => f.name === fileName)) {
        console.log(`Fichier correspondant exact trouvé pour l'équipe ${teamId}: ${fileName}`);
        const { data: { publicUrl } } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(fileName);
        
        return publicUrl;
      }
    }
    
    // Si aucune correspondance exacte n'est trouvée, lister tous les fichiers et en trouver un qui commence par teamId
    const { data: files, error } = await supabase
      .storage
      .from(BUCKET_NAME)
      .list();
    
    if (error) {
      console.error("Erreur lors de la liste des logos d'équipe:", error);
      return null;
    }
    
    // Chercher n'importe quel fichier qui commence par l'ID de l'équipe
    const logoFile = files.find(file => 
      file.name.toLowerCase().startsWith(teamId.toLowerCase()) ||
      // Vérifier aussi les noms courts/surnoms connus
      Object.entries(TEAM_NICKNAME_MAP).some(([nickname, fullName]) => 
        teamId.toLowerCase().includes(nickname.toLowerCase()) && 
        file.name.toLowerCase().includes(fullName.toLowerCase())
      )
    );
    
    if (logoFile) {
      console.log(`Fichier logo trouvé pour l'équipe ${teamId}: ${logoFile.name}`);
      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(logoFile.name);
      
      return publicUrl;
    }
    
    console.log(`Aucun logo trouvé pour l'équipe ${teamId} après vérification de toutes les méthodes`);
    return null;
    
  } catch (error) {
    console.error("Erreur lors de l'obtention de l'URL du logo d'équipe:", error);
    return null;
  }
};
