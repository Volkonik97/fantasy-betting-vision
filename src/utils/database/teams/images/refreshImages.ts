
import { supabase } from "@/integrations/supabase/client";
import { verifyImageExists } from "./verifyImage";
import { clearInvalidImageReference } from "./clearImages";

/**
 * Refreshes player image references by checking if they exist in storage and removing invalid ones
 * @returns An object with the count of fixed references and completion status
 */
export const refreshImageReferences = async (): Promise<{ fixedCount: number, completed: boolean }> => {
  try {
    console.log("Démarrage de la vérification des références d'images");
    
    // Also check for files in storage that don't have a corresponding player reference
    const { data: allFiles, error: listError } = await supabase
      .storage
      .from('player-images')
      .list('');
    
    if (listError) {
      console.error("Erreur lors de la liste des fichiers du bucket:", listError);
    } else {
      console.log(`Trouvé ${allFiles?.length || 0} fichiers dans le stockage`);
    }
    
    // Get all players with image references
    const { data: playersWithImages, error: selectError } = await supabase
      .from('players')
      .select('playerid, image')
      .not('image', 'is', null);
    
    if (selectError) {
      console.error("Erreur lors de la récupération des joueurs avec images:", selectError);
      return { fixedCount: 0, completed: false };
    }
    
    if (!playersWithImages || playersWithImages.length === 0) {
      console.log("Aucun joueur avec des images trouvé dans la base de données");
      
      // No players with images in DB, but we might have files in storage
      if (allFiles && allFiles.length > 0) {
        console.log(`Attention: ${allFiles.length} fichiers trouvés dans le stockage, mais aucune référence dans la base de données`);
      }
      
      return { fixedCount: 0, completed: true };
    }
    
    console.log(`Vérification de ${playersWithImages.length} références d'images de joueurs dans la base de données`);
    
    let fixedCount = 0;
    
    // Check each image reference
    for (const player of playersWithImages) {
      if (!player.image) continue;
      
      // Check if the image exists in storage
      const imageExists = await verifyImageExists(player.image);
      
      if (!imageExists) {
        console.log(`Image invalide détectée pour le joueur ${player.playerid}: ${player.image}`);
        
        // Clear the invalid image reference
        const success = await clearInvalidImageReference(player.playerid);
        
        if (success) {
          fixedCount++;
          console.log(`Référence d'image supprimée pour le joueur ${player.playerid}`);
        } else {
          console.error(`Échec de la suppression de la référence d'image pour le joueur ${player.playerid}`);
        }
      }
    }
    
    console.log(`Vérification terminée. ${fixedCount} références d'images ont été supprimées.`);
    
    return { fixedCount, completed: true };
  } catch (error) {
    console.error("Erreur lors de la vérification des références d'images:", error);
    return { fixedCount: 0, completed: false };
  }
};
