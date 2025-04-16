
import { supabase } from "@/integrations/supabase/client";

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
    // D'abord, si nous devons supprimer des fichiers du stockage, récupérer tous les joueurs avec des images
    if (deleteFromStorage) {
      console.log("Récupération des joueurs avec des références d'images avant la suppression");
      
      const { data: playersWithImages, error: selectError } = await supabase
        .from('players')
        .select('playerid, image')
        .not('image', 'is', null);
      
      if (!selectError && playersWithImages && playersWithImages.length > 0) {
        console.log(`Trouvé ${playersWithImages.length} joueurs avec des images à supprimer du stockage`);
        
        // Collecter tous les noms de fichiers à supprimer du stockage
        const filesToDelete: string[] = [];
        
        for (const player of playersWithImages) {
          if (player.image) {
            try {
              let filename = null;
              
              // Gérer les URLs complètes (extraire le nom de fichier)
              if (player.image.includes('player-images')) {
                const matches = player.image.match(/player-images\/([^?]+)/);
                if (matches && matches[1]) {
                  filename = decodeURIComponent(matches[1]);
                  console.log(`Nom de fichier extrait de l'URL: ${filename}`);
                }
              } 
              // Gérer les noms de fichiers directs
              else if (!player.image.includes('/') && !player.image.startsWith('http')) {
                filename = player.image;
                console.log(`Utilisation du nom de fichier direct: ${filename}`);
              }
              // Traiter le cas spécial pour les fichiers avec préfixe playerid
              else if (player.playerid) {
                // Essayer de construire le nom de fichier basé sur l'ID du joueur
                const possibleFilename = `playerid${player.playerid}.webp`;
                filesToDelete.push(possibleFilename);
                console.log(`Ajout du nom de fichier basé sur l'ID du joueur: ${possibleFilename}`);
              }
              
              if (filename) {
                filesToDelete.push(filename);
              }
            } catch (e) {
              console.warn(`Impossible de traiter l'URL d'image pour le joueur ${player.playerid}: ${player.image}`);
            }
          }
          
          // Même si nous n'avons pas trouvé d'URL, essayer avec l'ID du joueur
          if (player.playerid) {
            // Essayer aussi le format standardisé pour être sûr
            const standardFilename = `playerid${player.playerid}.webp`;
            if (!filesToDelete.includes(standardFilename)) {
              filesToDelete.push(standardFilename);
              console.log(`Ajout du nom de fichier standard pour le joueur: ${standardFilename}`);
            }
          }
        }
        
        // Ajouter une étape pour lister tous les fichiers du bucket et supprimer ceux qui ont le préfixe playerid
        try {
          const { data: allFiles, error: listError } = await supabase
            .storage
            .from('player-images')
            .list('');
          
          if (!listError && allFiles && allFiles.length > 0) {
            console.log(`Trouvé ${allFiles.length} fichiers dans le bucket player-images`);
            
            for (const file of allFiles) {
              if (file.name.startsWith('playerid')) {
                if (!filesToDelete.includes(file.name)) {
                  filesToDelete.push(file.name);
                  console.log(`Ajout du fichier trouvé dans le bucket: ${file.name}`);
                }
              }
            }
          }
        } catch (listError) {
          console.error("Erreur lors de la liste des fichiers du bucket:", listError);
        }
        
        if (filesToDelete.length > 0) {
          console.log(`Suppression de ${filesToDelete.length} fichiers du bucket player-images`);
          
          // Supprimer les fichiers par lots pour éviter de dépasser les limites de l'API
          const batchSize = 100;
          for (let i = 0; i < filesToDelete.length; i += batchSize) {
            const batch = filesToDelete.slice(i, i + batchSize);
            console.log(`Traitement du lot ${Math.floor(i / batchSize) + 1}/${Math.ceil(filesToDelete.length / batchSize)}, ${batch.length} fichiers`);
            
            const { error: deleteError } = await supabase
              .storage
              .from('player-images')
              .remove(batch);
            
            if (deleteError) {
              console.error(`Erreur lors de la suppression du lot ${Math.floor(i / batchSize) + 1}:`, deleteError);
            } else {
              console.log(`Lot ${Math.floor(i / batchSize) + 1} supprimé avec succès (${batch.length} fichiers)`);
            }
          }
        }
      } else if (selectError) {
        console.error("Erreur lors de la sélection des joueurs avec des images:", selectError);
      } else {
        console.log("Aucun joueur avec des images trouvé à supprimer du stockage");
        
        // Si aucun joueur n'a d'image, essayer quand même de nettoyer le bucket
        try {
          const { data: allFiles, error: listError } = await supabase
            .storage
            .from('player-images')
            .list('');
          
          if (!listError && allFiles && allFiles.length > 0) {
            console.log(`Même si aucun joueur n'a d'image, ${allFiles.length} fichiers trouvés dans le bucket`);
            
            const filesToDelete = allFiles.map(file => file.name);
            
            // Supprimer les fichiers par lots
            const batchSize = 100;
            for (let i = 0; i < filesToDelete.length; i += batchSize) {
              const batch = filesToDelete.slice(i, i + batchSize);
              console.log(`Traitement du lot ${Math.floor(i / batchSize) + 1}/${Math.ceil(filesToDelete.length / batchSize)}, ${batch.length} fichiers`);
              
              const { error: deleteError } = await supabase
                .storage
                .from('player-images')
                .remove(batch);
              
              if (deleteError) {
                console.error(`Erreur lors de la suppression du lot ${Math.floor(i / batchSize) + 1}:`, deleteError);
              } else {
                console.log(`Lot ${Math.floor(i / batchSize) + 1} supprimé avec succès (${batch.length} fichiers)`);
              }
            }
          }
        } catch (listError) {
          console.error("Erreur lors de la liste des fichiers du bucket:", listError);
        }
      }
    }
    
    // Maintenant, effacer toutes les références d'images dans la base de données
    const { data, error } = await supabase
      .from('players')
      .update({ image: null })
      .not('image', 'is', null);
    
    // Obtenir le nombre de lignes affectées
    const { count } = await supabase
      .from('players')
      .select('*', { count: 'exact', head: true })
      .not('image', 'is', null);
      
    if (error) {
      console.error("Erreur lors de la suppression de toutes les références d'images:", error);
      return { success: false, clearedCount: 0 };
    }
    
    console.log(`${count || 0} références d'images effacées avec succès`);
    
    return { success: true, clearedCount: count || 0 };
  } catch (error) {
    console.error("Erreur lors de la suppression de toutes les références d'images:", error);
    return { success: false, clearedCount: 0 };
  }
};
