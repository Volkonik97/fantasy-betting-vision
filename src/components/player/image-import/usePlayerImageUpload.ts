
import { useState, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';
import { PlayerWithImage } from './types';
import { getPlayers } from '@/utils/database/playersService';

export const usePlayerImageUpload = () => {
  const [players, setPlayers] = useState<PlayerWithImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadPlayers = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedPlayers = await getPlayers();
      const playerImageUploads: PlayerWithImage[] = fetchedPlayers.map(player => ({
        player,
        imageFile: null,
        newImageUrl: null,
        isUploading: false,
        processed: false,
        error: null
      }));
      setPlayers(playerImageUploads);
    } catch (error) {
      console.error('Error loading players:', error);
      toast.error('Impossible de charger les joueurs');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const uploadPlayerImage = useCallback(async (playerUpload: PlayerWithImage) => {
    if (!playerUpload.imageFile) return;
    
    // Create a copy of the players array to avoid mutating state directly
    const updatedPlayers = [...players];
    const playerIndex = updatedPlayers.findIndex(p => p.player.id === playerUpload.player.id);
    
    if (playerIndex === -1) return;
    
    // Update the player's status to uploading
    updatedPlayers[playerIndex] = {
      ...updatedPlayers[playerIndex],
      isUploading: true,
      error: null
    };
    
    setPlayers(updatedPlayers);

    try {
      // Change: Utiliser un format de nom de fichier cohérent pour éviter la prolifération de fichiers
      const cleanId = playerUpload.player.id.replace(/[^a-zA-Z0-9-_]/g, '');
      const fileExtension = playerUpload.imageFile.name.split('.').pop() || 'png';
      const fileName = `playerid${cleanId}.${fileExtension}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('player-images')
        .upload(fileName, playerUpload.imageFile, {
          cacheControl: '0', // Désactiver le cache pour forcer le rechargement
          upsert: true  // Remplacer si existe déjà
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('player-images')
        .getPublicUrl(fileName);

      // Ajouter un cache buster pour forcer le rechargement
      const publicUrlWithCacheBuster = `${publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from('players')
        .update({ image: publicUrlWithCacheBuster })
        .eq('playerid', playerUpload.player.id);

      if (updateError) {
        throw updateError;
      }

      // Update the player's status to success
      const finalPlayers = [...updatedPlayers];
      finalPlayers[playerIndex] = {
        ...finalPlayers[playerIndex],
        processed: true,
        isUploading: false,
        newImageUrl: publicUrlWithCacheBuster,
        player: {
          ...finalPlayers[playerIndex].player,
          image: publicUrlWithCacheBuster
        }
      };
      
      setPlayers(finalPlayers);
      
      toast.success(`Image téléchargée pour ${playerUpload.player.name}`);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      
      const errorPlayers = [...updatedPlayers];
      errorPlayers[playerIndex] = {
        ...errorPlayers[playerIndex],
        isUploading: false,
        processed: true,
        error: error instanceof Error ? error.message : String(error)
      };
      
      setPlayers(errorPlayers);
      
      toast.error(`Échec du téléchargement pour ${playerUpload.player.name}`);
    }
  }, [players]);

  const assignImageToPlayer = useCallback((file: File, playerIndex: number) => {
    const updatedPlayers = [...players];
    updatedPlayers[playerIndex] = {
      ...updatedPlayers[playerIndex],
      imageFile: file,
      newImageUrl: URL.createObjectURL(file),
      processed: false,
      error: null
    };
    setPlayers(updatedPlayers);
  }, [players]);

  return {
    players,
    isLoading,
    loadPlayers,
    uploadPlayerImage,
    assignImageToPlayer
  };
};
