
import { useState, useEffect, useCallback } from "react";
import { Player } from "@/utils/models/types";
import { getPlayers } from "@/utils/database/playersService";
import { PlayerWithImage, UploadStatus } from "./types";
import { uploadPlayerImage, updatePlayerImageReference } from "@/utils/database/teams/images/uploader";
import { toast } from "sonner";

export const usePlayerImages = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [playerImages, setPlayerImages] = useState<PlayerWithImage[]>([]);
  const [unmatched, setUnmatched] = useState<File[]>([]);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    total: 0,
    processed: 0,
    success: 0,
    failed: 0,
    inProgress: false
  });

  // Charger les joueurs
  useEffect(() => {
    const loadPlayers = async () => {
      setIsLoading(true);
      try {
        const allPlayers = await getPlayers(1, 1000);
        console.log(`Chargement de ${allPlayers.length} joueurs terminé`);
        
        setPlayers(allPlayers);
        
        const initialPlayerImages: PlayerWithImage[] = allPlayers.map(player => ({
          player,
          imageFile: null,
          newImageUrl: null,
          processed: false,
          isUploading: false,
          error: null
        }));
        
        setPlayerImages(initialPlayerImages);
      } catch (error) {
        console.error("Erreur lors du chargement des joueurs:", error);
        toast.error("Erreur lors du chargement des joueurs");
      } finally {
        setIsLoading(false);
      }
    };

    loadPlayers();
  }, []);

  // Normaliser une chaîne pour la recherche de correspondance
  const normalizeString = (str: string): string => {
    return str
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "");
  };

  // Trouver un joueur correspondant au nom de fichier
  const findMatchingPlayer = useCallback((fileName: string): number => {
    const normalizedFileName = normalizeString(fileName);
    
    for (let i = 0; i < playerImages.length; i++) {
      const normalizedPlayerName = normalizeString(playerImages[i].player.name);
      
      if (normalizedPlayerName === normalizedFileName ||
          normalizedFileName.includes(normalizedPlayerName) ||
          normalizedPlayerName.includes(normalizedFileName)) {
        return i;
      }
    }
    
    return -1;
  }, [playerImages]);

  // Gérer la sélection de fichiers
  const handleFileSelect = useCallback((files: File[]) => {
    const updatedPlayerImages = [...playerImages];
    const unmatchedFiles: File[] = [];
    
    files.forEach(file => {
      const fileName = file.name.toLowerCase().replace(/\.[^/.]+$/, "");
      const matchIndex = findMatchingPlayer(fileName);
      
      if (matchIndex !== -1) {
        const objectUrl = URL.createObjectURL(file);
        
        updatedPlayerImages[matchIndex] = {
          ...updatedPlayerImages[matchIndex],
          imageFile: file,
          newImageUrl: objectUrl,
          error: null
        };
      } else {
        unmatchedFiles.push(file);
      }
    });
    
    setPlayerImages(updatedPlayerImages);
    setUnmatched(prev => [...prev, ...unmatchedFiles]);
    
    if (unmatchedFiles.length > 0) {
      toast.warning(`${unmatchedFiles.length} images n'ont pas pu être associées à des joueurs`);
    }
  }, [playerImages, findMatchingPlayer]);

  // Associer manuellement un fichier à un joueur
  const assignFileToPlayer = useCallback((file: File, playerIndex: number) => {
    const updatedPlayerImages = [...playerImages];
    const objectUrl = URL.createObjectURL(file);
    
    updatedPlayerImages[playerIndex] = {
      ...updatedPlayerImages[playerIndex],
      imageFile: file,
      newImageUrl: objectUrl,
      error: null
    };
    
    setPlayerImages(updatedPlayerImages);
    setUnmatched(prev => prev.filter(f => f !== file));
  }, [playerImages]);

  // Télécharger les images
  const uploadImages = useCallback(async (bucketExists: boolean) => {
    if (!bucketExists) {
      toast.error("Le bucket de stockage n'est pas accessible. Impossible de télécharger les images.");
      return;
    }
    
    const playersToUpdate = playerImages.filter(p => p.imageFile !== null && !p.processed);
    
    if (playersToUpdate.length === 0) {
      toast.info("Aucune nouvelle image à télécharger");
      return;
    }
    
    setUploadStatus({
      total: playersToUpdate.length,
      processed: 0,
      success: 0,
      failed: 0,
      inProgress: true
    });
    
    const updatedPlayerImages = [...playerImages];
    
    // Diviser en lots de 3 pour éviter de saturer la connexion
    const batchSize = 3;
    const batches = Math.ceil(playersToUpdate.length / batchSize);
    
    for (let batch = 0; batch < batches; batch++) {
      const batchStart = batch * batchSize;
      const batchEnd = Math.min(batchStart + batchSize, playersToUpdate.length);
      const currentBatch = playersToUpdate.slice(batchStart, batchEnd);
      
      // Marquer les joueurs comme étant en cours de téléchargement
      currentBatch.forEach(playerData => {
        const index = updatedPlayerImages.findIndex(p => p.player.id === playerData.player.id);
        if (index !== -1) {
          updatedPlayerImages[index] = {
            ...updatedPlayerImages[index],
            isUploading: true
          };
        }
      });
      
      setPlayerImages(updatedPlayerImages);
      
      // Télécharger les images en parallèle
      const batchPromises = currentBatch.map(async (playerData) => {
        if (!playerData.imageFile) return;
        
        const playerId = playerData.player.id;
        
        try {
          // Upload de l'image
          const uploadResult = await uploadPlayerImage(playerId, playerData.imageFile, 60000);
          
          const playerIndex = updatedPlayerImages.findIndex(p => p.player.id === playerId);
          
          if (!uploadResult.success) {
            // Échec du téléchargement
            if (playerIndex !== -1) {
              updatedPlayerImages[playerIndex] = {
                ...updatedPlayerImages[playerIndex],
                isUploading: false,
                error: uploadResult.error || "Erreur inconnue"
              };
            }
            
            setUploadStatus(prev => ({
              ...prev,
              processed: prev.processed + 1,
              failed: prev.failed + 1
            }));
            
            return;
          }
          
          // Si l'upload a réussi, mettre à jour la référence dans la base de données
          const updateSuccess = await updatePlayerImageReference(playerId, uploadResult.publicUrl!);
          
          if (!updateSuccess) {
            if (playerIndex !== -1) {
              updatedPlayerImages[playerIndex] = {
                ...updatedPlayerImages[playerIndex],
                isUploading: false,
                error: "Échec de la mise à jour dans la base de données"
              };
            }
            
            setUploadStatus(prev => ({
              ...prev,
              processed: prev.processed + 1,
              failed: prev.failed + 1
            }));
            
            return;
          }
          
          // Succès complet
          if (playerIndex !== -1) {
            updatedPlayerImages[playerIndex] = {
              ...updatedPlayerImages[playerIndex],
              isUploading: false,
              processed: true,
              player: {
                ...updatedPlayerImages[playerIndex].player,
                image: uploadResult.publicUrl
              }
            };
          }
          
          setUploadStatus(prev => ({
            ...prev,
            processed: prev.processed + 1,
            success: prev.success + 1
          }));
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          const playerIndex = updatedPlayerImages.findIndex(p => p.player.id === playerId);
          
          if (playerIndex !== -1) {
            updatedPlayerImages[playerIndex] = {
              ...updatedPlayerImages[playerIndex],
              isUploading: false,
              error: errorMessage
            };
          }
          
          setUploadStatus(prev => ({
            ...prev,
            processed: prev.processed + 1,
            failed: prev.failed + 1
          }));
        }
      });
      
      await Promise.all(batchPromises);
      setPlayerImages([...updatedPlayerImages]);
      
      // Petit délai entre les lots pour éviter de saturer la connexion
      if (batch < batches - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    setUploadStatus(prev => ({
      ...prev,
      inProgress: false
    }));
    
    if (uploadStatus.success > 0) {
      toast.success(`${uploadStatus.success} images téléchargées avec succès`);
    }
    
    if (uploadStatus.failed > 0) {
      toast.error(`${uploadStatus.failed} images n'ont pas pu être téléchargées`);
    }
  }, [playerImages]);

  return {
    playerImages,
    unmatched,
    isLoading,
    uploadStatus,
    handleFileSelect,
    assignFileToPlayer,
    uploadImages
  };
};
