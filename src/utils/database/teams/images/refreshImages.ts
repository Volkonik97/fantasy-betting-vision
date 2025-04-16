
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
    
    // Get all players with image references
    const { data: playersWithImages, error: selectError } = await supabase
      .from('players')
      .select('playerid, image')
      .not('image', 'is', null)
      .limit(100); // Process in batches of 100 to avoid timeouts
    
    if (selectError) {
      console.error("Erreur lors de la récupération des joueurs avec images:", selectError);
      return { fixedCount: 0, completed: false };
    }
    
    if (!playersWithImages || playersWithImages.length === 0) {
      console.log("Aucun joueur avec des images trouvé");
      return { fixedCount: 0, completed: true };
    }
    
    console.log(`Vérification de ${playersWithImages.length} références d'images de joueurs`);
    
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
    
    // Determine if there are more players to process
    const { count, error: countError } = await supabase
      .from('players')
      .select('playerid', { count: 'exact' })
      .not('image', 'is', null);
    
    if (countError) {
      console.error("Erreur lors du comptage des joueurs restants:", countError);
      return { fixedCount, completed: false };
    }
    
    const completed = count === 0 || playersWithImages.length >= count;
    
    if (completed) {
      console.log("Vérification des références d'images terminée");
    } else {
      console.log(`Il reste ${count - playersWithImages.length} références d'images à vérifier`);
    }
    
    return { fixedCount, completed };
  } catch (error) {
    console.error("Erreur lors de la vérification des références d'images:", error);
    return { fixedCount: 0, completed: false };
  }
};
