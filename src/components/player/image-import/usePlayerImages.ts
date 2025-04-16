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
  const [loadingProgress, setLoadingProgress] = useState<{percent: number, message: string}>({
    percent: 0,
    message: "Initialisation..."
  });

  // Charger les joueurs avec pagination pour dépasser la limite de 1000
  useEffect(() => {
    const loadPlayers = async () => {
      setIsLoading(true);
      setLoadingProgress({percent: 0, message: "Préparation du chargement des joueurs..."});
      
      try {
        // Utiliser loadAllPlayersInBatches pour charger tous les joueurs avec callback de progression
        const allPlayers = await loadAllPlayersInBatches((loaded, total, batch) => {
          const percent = Math.round((loaded / total) * 100);
          setLoadingProgress({
            percent,
            message: `Chargement des joueurs: ${loaded}/${total} (lot ${batch}/${Math.ceil(total/500)})`
          });
        });
        
        console.log(`Chargement de ${allPlayers.length} joueurs terminé (en lots)`);
        setLoadingProgress({percent: 100, message: "Initialisation des données..."});
        
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
        setLoadingProgress({percent: 100, message: "Chargement terminé"});
      } catch (error) {
        console.error("Erreur lors du chargement des joueurs:", error);
        toast.error("Erreur lors du chargement des joueurs");
        setLoadingProgress({
          percent: 0, 
          message: `Erreur: ${error instanceof Error ? error.message : String(error)}`
        });
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
    
    toast.info(`Début du téléchargement de ${uploadsData.length} images...`);
    console.log(`Starting upload of ${uploadsData.length} images`);
    
    // Utiliser la fonction d'upload multiple avec limite de concurrence
    try {
      // Utiliser une fonction qui supporte les mises à jour de progression
      const results = await uploadMultiplePlayerImagesWithProgress(
        uploadsData, 
        3,
        (processed, total) => {
          console.log(`Upload progress: ${processed}/${total}`);
          setUploadStatus(prev => ({
            ...prev,
            processed
          }));
        }
      );
      
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

  // Version améliorée de uploadMultiplePlayerImages avec support de progression
  const uploadMultiplePlayerImagesWithProgress = async (
    uploads: { playerId: string; file: File }[],
    concurrencyLimit: number = 3,
    progressCallback?: (processed: number, total: number) => void
  ): Promise<{ success: number; failed: number; errors: Record<string, string> }> => {
    const results = {
      success: 0,
      failed: 0,
      errors: {} as Record<string, string>
    };
    
    // Trier les fichiers par taille pour uploader les plus petits en premier
    const sortedUploads = [...uploads].sort((a, b) => a.file.size - b.file.size);
    let processed = 0;
    const total = sortedUploads.length;
    
    // Fonction pour traiter un lot d'uploads
    const processBatch = async (batch: typeof uploads) => {
      const promises = batch.map(async ({ playerId, file }) => {
        try {
          const result = await uploadPlayerImage(playerId, file);
          
          if (!result.success) {
            results.failed++;
            results.errors[playerId] = result.error || "Erreur inconnue";
            return { success: false, playerId };
          }
          
          const updateSuccess = await updatePlayerImageReference(playerId, result.publicUrl!);
          
          if (!updateSuccess) {
            results.failed++;
            results.errors[playerId] = "Échec de la mise à jour dans la base de données";
            return { success: false, playerId };
          }
          
          results.success++;
          return { success: true, playerId, imageUrl: result.publicUrl };
        } catch (error) {
          results.failed++;
          results.errors[playerId] = error instanceof Error ? error.message : String(error);
          return { success: false, playerId };
        } finally {
          processed++;
          if (progressCallback) {
            progressCallback(processed, total);
          }
        }
      });
      
      return Promise.all(promises);
    };
    
    // Diviser en lots pour limiter la concurrence
    for (let i = 0; i < sortedUploads.length; i += concurrencyLimit) {
      const batch = sortedUploads.slice(i, i + concurrencyLimit);
      await processBatch(batch);
      
      // Petite pause entre les lots pour éviter de surcharger le réseau
      if (i + concurrencyLimit < sortedUploads.length) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
    
    return results;
  };

  return {
    playerImages,
    unmatched,
    isLoading,
    uploadStatus,
    loadingProgress,
    handleFileSelect,
    assignFileToPlayer,
    uploadImages
  };
};
