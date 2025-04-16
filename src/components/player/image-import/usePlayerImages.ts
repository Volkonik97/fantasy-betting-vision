
import { useState, useEffect, useCallback } from "react";
import { Player } from "@/utils/models/types";
import { loadAllPlayersInBatches } from "@/services/playerService";
import { PlayerWithImage, UploadStatus } from "./types";
import { uploadPlayerImage, updatePlayerImageReference, uploadMultiplePlayerImages } from "@/utils/database/teams/images/uploader";
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

  // Charger les joueurs avec pagination pour dépasser la limite de 1000
  useEffect(() => {
    const loadPlayers = async () => {
      setIsLoading(true);
      try {
        // Utiliser loadAllPlayersInBatches pour charger tous les joueurs
        const allPlayers = await loadAllPlayersInBatches();
        console.log(`Chargement de ${allPlayers.length} joueurs terminé (en lots)`);
        
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
    
    // Recherche de correspondance exacte d'abord
    for (let i = 0; i < playerImages.length; i++) {
      const normalizedPlayerName = normalizeString(playerImages[i].player.name);
      if (normalizedPlayerName === normalizedFileName) {
        return i;
      }
    }
    
    // Recherche de correspondance contenue
    for (let i = 0; i < playerImages.length; i++) {
      const normalizedPlayerName = normalizeString(playerImages[i].player.name);
      if (normalizedFileName.includes(normalizedPlayerName) || 
          normalizedPlayerName.includes(normalizedFileName)) {
        return i;
      }
    }
    
    return -1;
  }, [playerImages]);

  // Gérer la sélection de fichiers
  const handleFileSelect = useCallback((files: File[]) => {
    if (files.length === 0) return;
    
    toast.info(`Traitement de ${files.length} fichiers...`);
    
    const updatedPlayerImages = [...playerImages];
    const unmatchedFiles: File[] = [];
    let matchedCount = 0;
    
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
        
        matchedCount++;
      } else {
        unmatchedFiles.push(file);
      }
    });
    
    setPlayerImages(updatedPlayerImages);
    setUnmatched(prev => [...prev, ...unmatchedFiles]);
    
    if (matchedCount > 0) {
      toast.success(`${matchedCount} images associées automatiquement`);
    }
    
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
    
    // Marquer les joueurs comme étant en cours de téléchargement
    const updatedPlayerImages = playerImages.map(p => {
      if (p.imageFile && !p.processed) {
        return { ...p, isUploading: true };
      }
      return p;
    });
    
    setPlayerImages(updatedPlayerImages);
    
    // Préparer les données pour l'upload multiple
    const uploadsData = playersToUpdate.map(p => ({
      playerId: p.player.id,
      file: p.imageFile!
    }));
    
    // Utiliser la fonction d'upload multiple avec limite de concurrence
    try {
      const results = await uploadMultiplePlayerImages(uploadsData, 3);
      
      // Mettre à jour les statuts des joueurs avec les résultats
      const finalPlayerImages = updatedPlayerImages.map(p => {
        if (p.imageFile && !p.processed) {
          const error = results.errors[p.player.id];
          return {
            ...p,
            isUploading: false,
            processed: !error,
            error: error || null
          };
        }
        return p;
      });
      
      setPlayerImages(finalPlayerImages);
      
      setUploadStatus({
        total: playersToUpdate.length,
        processed: playersToUpdate.length,
        success: results.success,
        failed: results.failed,
        inProgress: false
      });
      
      if (results.success > 0) {
        toast.success(`${results.success} images téléchargées avec succès`);
      }
      
      if (results.failed > 0) {
        toast.error(`${results.failed} images n'ont pas pu être téléchargées`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Erreur lors du téléchargement des images:", errorMessage);
      
      // Mise à jour de tous les joueurs en erreur
      const errorPlayerImages = updatedPlayerImages.map(p => {
        if (p.isUploading) {
          return {
            ...p,
            isUploading: false,
            error: errorMessage
          };
        }
        return p;
      });
      
      setPlayerImages(errorPlayerImages);
      
      setUploadStatus({
        total: playersToUpdate.length,
        processed: playersToUpdate.length,
        success: 0,
        failed: playersToUpdate.length,
        inProgress: false
      });
      
      toast.error("Erreur lors du téléchargement des images");
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
