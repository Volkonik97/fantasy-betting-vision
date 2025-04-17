import { useState, useEffect, useCallback } from "react";
import { PlayerWithImage, UploadStatus } from "./types";
import { Player } from "@/utils/models/types";
import { loadAllPlayersInBatches } from "@/services/playerService";
import { uploadMultiplePlayerImagesWithProgress } from "@/utils/database/teams/images/uploader";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const usePlayerImages = () => {
  const [playerImages, setPlayerImages] = useState<PlayerWithImage[]>([]);
  const [unmatched, setUnmatched] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingProgress, setLoadingProgress] = useState({
    message: "Initialisation...",
    percent: 0
  });
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    total: 0,
    processed: 0,
    success: 0,
    failed: 0,
    inProgress: false
  });
  const [filterTab, setFilterTab] = useState("all");

  useEffect(() => {
    if (uploadStatus.processed > 0 && uploadStatus.processed === uploadStatus.total && !uploadStatus.inProgress) {
      refreshPlayerImages();
    }
  }, [uploadStatus]);

  const refreshPlayerImages = async () => {
    if (isLoading) return;
    
    console.log("Refreshing player images to get latest data");
    
    setIsLoading(true);
    setLoadingProgress({
      message: "Actualisation des données des joueurs...",
      percent: 50
    });
    
    try {
      const players = await loadAllPlayersInBatches((progress, total) => {
        setLoadingProgress({
          message: `Actualisation des données (${progress}/${total})`,
          percent: Math.min(90, (progress / total) * 100)
        });
      });
      
      const updatedPlayerImages = players.map(player => {
        const existingPlayerData = playerImages.find(p => p.player.id === player.id);
        
        return {
          player,
          imageFile: existingPlayerData?.imageFile || null,
          newImageUrl: null,
          processed: false,
          isUploading: false,
          error: null
        };
      });
      
      setPlayerImages(updatedPlayerImages);
      setLoadingProgress({ message: "Données actualisées", percent: 100 });
    } catch (error) {
      console.error("Error refreshing player images:", error);
      toast.error("Erreur lors de l'actualisation des données des joueurs");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadPlayers = async () => {
      setIsLoading(true);
      setLoadingProgress({ message: "Chargement des joueurs...", percent: 10 });
      
      try {
        const players = await loadAllPlayersInBatches((progress, total) => {
          setLoadingProgress({
            message: `Chargement des joueurs (${progress}/${total})`,
            percent: Math.min(90, (progress / total) * 100)
          });
        });
        
        setLoadingProgress({ message: "Préparation de l'interface...", percent: 95 });
        
        const mappedPlayers: PlayerWithImage[] = players.map(player => ({
          player,
          imageFile: null,
          newImageUrl: null,
          processed: false,
          isUploading: false,
          error: null
        }));
        
        setPlayerImages(mappedPlayers);
        setLoadingProgress({ message: "Terminé", percent: 100 });
      } catch (error) {
        console.error("Error loading players:", error);
        toast.error("Erreur lors du chargement des joueurs");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPlayers();
  }, []);

  const handleFileSelect = useCallback((files: File[]) => {
    if (!files.length) return;
    
    const updatedPlayerImages = [...playerImages];
    const unmatchedFiles: File[] = [];
    
    files.forEach(file => {
      const fileName = file.name.toLowerCase().replace(/\.[^/.]+$/, "");
      const matchedPlayerIndex = updatedPlayerImages.findIndex(
        p => p.player.name.toLowerCase().includes(fileName) || 
             fileName.includes(p.player.name.toLowerCase())
      );
      
      if (matchedPlayerIndex !== -1) {
        const playerImage = updatedPlayerImages[matchedPlayerIndex];
        
        if (!playerImage.imageFile || (playerImage.imageFile && file.size > playerImage.imageFile.size)) {
          updatedPlayerImages[matchedPlayerIndex] = {
            ...playerImage,
            imageFile: file,
            newImageUrl: URL.createObjectURL(file),
            processed: false,
            error: null
          };
        }
      } else {
        unmatchedFiles.push(file);
      }
    });
    
    setPlayerImages(updatedPlayerImages);
    setUnmatched(prev => [...prev, ...unmatchedFiles]);
    
    toast.success(`${files.length} images importées, ${unmatchedFiles.length} non associées`);
  }, [playerImages]);

  const assignFileToPlayer = useCallback((file: File, playerIndex: number) => {
    setPlayerImages(prev => {
      const updated = [...prev];
      updated[playerIndex] = {
        ...updated[playerIndex],
        imageFile: file,
        newImageUrl: URL.createObjectURL(file),
        processed: false,
        error: null
      };
      return updated;
    });
    
    setUnmatched(prev => prev.filter(f => f !== file));
    
    toast.success("Image associée avec succès");
  }, []);

  const uploadImages = useCallback(async (bucketExists: boolean) => {
    if (!bucketExists) {
      toast.error("Le bucket de stockage n'existe pas");
      return;
    }
    
    const playersWithImages = playerImages.filter(p => p.imageFile && !p.processed);
    
    if (playersWithImages.length === 0) {
      toast.info("Aucune image à télécharger");
      return;
    }
    
    setUploadStatus({
      total: playersWithImages.length,
      processed: 0,
      success: 0,
      failed: 0,
      inProgress: true
    });
    
    setPlayerImages(prev => prev.map(p => ({
      ...p,
      isUploading: p.imageFile && !p.processed ? true : p.isUploading
    })));
    
    const uploads = playersWithImages.map(p => ({
      playerId: p.player.id || '',
      file: p.imageFile as File
    }));
    
    try {
      const results = await uploadMultiplePlayerImagesWithProgress(uploads, (processed, total) => {
        setUploadStatus(prev => ({
          ...prev,
          processed
        }));
      });
      
      setPlayerImages(prev => prev.map(p => {
        const playerId = p.player.id || '';
        
        if (p.imageFile && !p.processed) {
          const hasError = results.errors[playerId];
          
          return {
            ...p,
            processed: !hasError,
            isUploading: false,
            error: hasError || null
          };
        }
        
        return p;
      }));
      
      setUploadStatus(prev => ({
        ...prev,
        success: results.success,
        failed: results.failed,
        inProgress: false
      }));
      
      if (results.failed === 0) {
        toast.success(`${results.success} images téléchargées avec succès`);
      } else {
        toast.error(`${results.success} images téléchargées, ${results.failed} échecs`);
      }
      
      setTimeout(() => {
        refreshPlayerImages();
      }, 1500);
      
    } catch (error) {
      console.error("Upload error:", error);
      
      setPlayerImages(prev => prev.map(p => ({
        ...p,
        isUploading: false,
        error: p.imageFile && !p.processed ? "Erreur lors du téléchargement" : p.error
      })));
      
      setUploadStatus(prev => ({
        ...prev,
        failed: prev.total,
        inProgress: false
      }));
      
      toast.error("Erreur lors du téléchargement des images");
    }
  }, [playerImages]);

  return {
    playerImages,
    unmatched,
    isLoading,
    uploadStatus,
    loadingProgress,
    handleFileSelect,
    assignFileToPlayer,
    uploadImages,
    filterTab,
    setFilterTab,
    refreshPlayerImages
  };
};
