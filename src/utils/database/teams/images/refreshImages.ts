
import { supabase } from "@/integrations/supabase/client";
import { verifyImageExists } from "./verifyImage";
import { toast } from "sonner";

const extractPlayerIdFromFilename = (filename: string): string | null => {
  const playerIdMatch = filename.match(/playerid([^\.\_]+)/);
  return playerIdMatch ? playerIdMatch[1] : null;
};

export const synchronizeReferences = async (): Promise<{
  addedCount: number;
  removedCount: number;
  completed: boolean;
}> => {
  try {
    console.log("Démarrage de la synchronisation des références d'images");
    
    // 1. List all files in storage
    const { data: allFiles, error: listError } = await supabase
      .storage
      .from('player-images')
      .list('');
    
    if (listError) {
      console.error("Erreur lors de la liste des fichiers du bucket:", listError);
      toast.error("Impossible de lister les fichiers du bucket");
      return { addedCount: 0, removedCount: 0, completed: false };
    }
    
    // 2. Get all players from database
    const { data: players, error: playerError } = await supabase
      .from('players')
      .select('playerid, image');
    
    if (playerError) {
      console.error("Erreur lors de la récupération des joueurs:", playerError);
      toast.error("Impossible de récupérer les joueurs");
      return { addedCount: 0, removedCount: 0, completed: false };
    }
    
    let addedCount = 0;
    let removedCount = 0;
    
    // 3. Synchronize files and database records
    for (const file of (allFiles || [])) {
      const playerId = extractPlayerIdFromFilename(file.name);
      
      if (playerId) {
        // Find corresponding player
        const player = players.find(p => p.playerid === playerId);
        
        if (!player || !player.image) {
          // Create public URL for this file
          const { data: publicUrlData } = supabase
            .storage
            .from('player-images')
            .getPublicUrl(file.name);
          
          const publicUrl = publicUrlData?.publicUrl;
          
          if (publicUrl) {
            // Update or insert player with image reference
            const { error: upsertError } = await supabase
              .from('players')
              .upsert({ 
                playerid: playerId, 
                image: publicUrl 
              }, { onConflict: 'playerid' });
            
            if (!upsertError) {
              console.log(`Ajouté référence d'image pour joueur ${playerId}`);
              addedCount++;
            }
          }
        }
      }
    }
    
    // 4. Remove invalid image references from database
    for (const player of players) {
      if (player.image && !allFiles.some(file => player.image.includes(file.name))) {
        const { error: clearError } = await supabase
          .from('players')
          .update({ image: null })
          .eq('playerid', player.playerid);
        
        if (!clearError) {
          console.log(`Supprimé référence d'image invalide pour joueur ${player.playerid}`);
          removedCount++;
        }
      }
    }
    
    console.log(`Synchronisation terminée: ${addedCount} ajoutés, ${removedCount} supprimés`);
    
    return { addedCount, removedCount, completed: true };
  } catch (error) {
    console.error("Erreur lors de la synchronisation:", error);
    toast.error("Erreur lors de la synchronisation des références");
    return { addedCount: 0, removedCount: 0, completed: false };
  }
};
