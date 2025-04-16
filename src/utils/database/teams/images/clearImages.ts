
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Clear an invalid image reference from a player
 * @param playerId The player ID to update
 * @returns Boolean indicating success
 */
export const clearInvalidImageReference = async (playerId: string): Promise<boolean> => {
  try {
    console.log(`Suppression de la référence d'image pour le joueur: ${playerId}`);
    
    // D'abord, obtenir la référence d'image actuelle
    const { data: player, error: selectError } = await supabase
      .from('players')
      .select('image')
      .eq('playerid', playerId)
      .single();
    
    if (selectError) {
      console.error("Erreur lors de la récupération de l'image du joueur:", selectError);
      return false;
    }
    
    // Si le joueur a une référence d'image, essayer de la supprimer du stockage
    if (player?.image) {
      try {
        // Extraire le nom de fichier de l'URL si c'est une URL de stockage Supabase
        let filename = null;
        if (player.image.includes('player-images')) {
          const matches = player.image.match(/player-images\/([^?]+)/);
          if (matches && matches[1]) {
            filename = decodeURIComponent(matches[1]);
          } else if (!player.image.includes('/')) {
            // Si c'est juste un nom de fichier sans séparateurs de chemin
            filename = player.image;
          }
          
          if (filename) {
            console.log(`Tentative de suppression du fichier du stockage: ${filename}`);
            const { error: deleteError } = await supabase
              .storage
              .from('player-images')
              .remove([filename]);
            
            if (deleteError) {
              console.warn(`Impossible de supprimer le fichier du stockage: ${deleteError.message}`);
              // Continuer même si la suppression du fichier échoue
            } else {
              console.log(`Fichier supprimé du stockage avec succès: ${filename}`);
            }
          }
        }
      } catch (storageError) {
        console.warn("Erreur lors de la suppression du fichier du stockage:", storageError);
        // Continuer à mettre à jour la base de données même si la suppression du fichier échoue
      }
    }
    
    // Mettre à jour l'enregistrement du joueur pour effacer la référence d'image
    const { error } = await supabase
      .from('players')
      .update({ image: null })
      .eq('playerid', playerId);
    
    if (error) {
      console.error("Erreur lors de la suppression de la référence d'image:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Erreur dans clearInvalidImageReference:", error);
    return false;
  }
};

/**
 * Clear all player image references and optionally remove files from storage
 * @param deleteFromStorage Whether to also delete the files from storage (optional, defaults to true)
 * @returns Object with success status and count of cleared references
 */
export const clearAllPlayerImageReferences = async (deleteFromStorage: boolean = true): Promise<{ success: boolean, clearedCount: number }> => {
  try {
    let filesToDelete: string[] = [];
    
    // Premièrement, lister TOUS les fichiers dans le bucket
    if (deleteFromStorage) {
      try {
        const { data: allFiles, error: listError } = await supabase
          .storage
          .from('player-images')
          .list('');
        
        if (!listError && allFiles && allFiles.length > 0) {
          console.log(`Trouvé ${allFiles.length} fichiers dans le bucket player-images`);
          
          // Ajouter tous les fichiers à la liste à supprimer
          filesToDelete = allFiles.map(file => file.name);
          console.log(`Fichiers à supprimer: ${filesToDelete.join(', ')}`);
        } else if (listError) {
          console.error("Erreur lors de la liste des fichiers du bucket:", listError);
          toast.error("Erreur lors de la liste des fichiers du bucket");
        } else {
          console.log("Aucun fichier trouvé dans le bucket player-images");
        }
      } catch (listError) {
        console.error("Exception lors de la liste des fichiers du bucket:", listError);
      }
    }
    
    // Maintenant, récupérer tous les joueurs avec des images pour mettre à jour DB
    const { data: playersWithImages, error: selectError } = await supabase
      .from('players')
      .select('playerid, image')
      .not('image', 'is', null);
    
    let playerCount = 0;
    if (!selectError && playersWithImages && playersWithImages.length > 0) {
      playerCount = playersWithImages.length;
      console.log(`Trouvé ${playerCount} joueurs avec des références d'images à supprimer`);
    }
    
    // Supprimer les fichiers du stockage par lots
    if (deleteFromStorage && filesToDelete.length > 0) {
      console.log(`Suppression de ${filesToDelete.length} fichiers du bucket player-images`);
      
      // Supprimer les fichiers par lots pour éviter de dépasser les limites de l'API
      const batchSize = 100;
      for (let i = 0; i < filesToDelete.length; i += batchSize) {
        const batch = filesToDelete.slice(i, i + batchSize);
        console.log(`Traitement du lot ${Math.floor(i / batchSize) + 1}/${Math.ceil(filesToDelete.length / batchSize)}, ${batch.length} fichiers`);
        
        try {
          const { error: deleteError, data } = await supabase
            .storage
            .from('player-images')
            .remove(batch);
          
          if (deleteError) {
            console.error(`Erreur lors de la suppression du lot ${Math.floor(i / batchSize) + 1}:`, deleteError);
            toast.error(`Erreur lors de la suppression des fichiers: ${deleteError.message}`);
          } else {
            console.log(`Lot ${Math.floor(i / batchSize) + 1} supprimé avec succès (${batch.length} fichiers)`, data);
          }
        } catch (e) {
          console.error(`Exception lors de la suppression du lot ${Math.floor(i / batchSize) + 1}:`, e);
        }
      }
    }
    
    // Vérifier l'état du bucket après suppression
    try {
      const { data: remainingFiles, error: checkError } = await supabase
        .storage
        .from('player-images')
        .list('');
      
      if (!checkError) {
        console.log(`Après suppression: ${remainingFiles?.length || 0} fichiers restants dans le bucket`);
        if (remainingFiles && remainingFiles.length > 0) {
          console.log("Fichiers restants:", remainingFiles.map(f => f.name).join(', '));
        }
      }
    } catch (e) {
      console.error("Erreur lors de la vérification des fichiers restants:", e);
    }
    
    // Effacer toutes les références d'images dans la base de données
    const { error: updateError } = await supabase
      .from('players')
      .update({ image: null })
      .not('image', 'is', null);
    
    if (updateError) {
      console.error("Erreur lors de la suppression des références d'images dans la DB:", updateError);
      return { success: false, clearedCount: 0 };
    }
    
    return { 
      success: true, 
      clearedCount: playerCount || filesToDelete.length || 0 
    };
  } catch (error) {
    console.error("Erreur lors de la suppression de toutes les références d'images:", error);
    return { success: false, clearedCount: 0 };
  }
};
