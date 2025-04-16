
import { useState, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';
import { PlayerImageUpload } from './types';
import { getPlayers } from '@/utils/database/playersService';

export const usePlayerImageUpload = () => {
  const [players, setPlayers] = useState<PlayerImageUpload[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadPlayers = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedPlayers = await getPlayers();
      const playerImageUploads: PlayerImageUpload[] = fetchedPlayers.map(player => ({
        player,
        status: 'idle',
        file: null,
        url: null,
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

  const uploadPlayerImage = useCallback(async (playerUpload: PlayerImageUpload) => {
    if (!playerUpload.file) return;
    
    // Create a copy of the players array to avoid mutating state directly
    const updatedPlayers = [...players];
    const playerIndex = updatedPlayers.findIndex(p => p.player.id === playerUpload.player.id);
    
    if (playerIndex === -1) return;
    
    // Update the player's status to uploading
    updatedPlayers[playerIndex] = {
      ...updatedPlayers[playerIndex],
      status: 'uploading',
      error: null
    };
    
    setPlayers(updatedPlayers);

    try {
      const fileName = `${playerUpload.player.id}_${Date.now()}.${playerUpload.file.name.split('.').pop()}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('player-images')
        .upload(fileName, playerUpload.file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('player-images')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('players')
        .update({ image: publicUrl })
        .eq('playerid', playerUpload.player.id);

      if (updateError) {
        throw updateError;
      }

      // Update the player's status to success
      const finalPlayers = [...updatedPlayers];
      finalPlayers[playerIndex] = {
        ...finalPlayers[playerIndex],
        status: 'success',
        url: publicUrl,
        player: {
          ...finalPlayers[playerIndex].player,
          image: publicUrl
        }
      };
      
      setPlayers(finalPlayers);
      
      toast.success(`Image téléchargée pour ${playerUpload.player.name}`);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      
      const errorPlayers = [...updatedPlayers];
      errorPlayers[playerIndex] = {
        ...errorPlayers[playerIndex],
        status: 'error',
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
      file,
      status: 'idle',
      url: URL.createObjectURL(file),
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
