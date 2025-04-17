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
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [refreshScheduled, setRefreshScheduled] = useState(false);

  useEffect(() => {
    if (uploadStatus.processed > 0 && 
        uploadStatus.processed === uploadStatus.total && 
        !uploadStatus.inProgress && 
        !refreshScheduled && 
        uploadStatus.success > 0) {
      
      console.log("Upload completed. Scheduling data refresh...");
      setRefreshScheduled(true);
      
      const delays = [2000, 5000, 10000, 15000];
      
      delays.forEach((delay, index) => {
        setTimeout(() => {
          console.log(`Executing scheduled refresh #${index + 1} after ${delay}ms`);
          refreshPlayerImages();
          
          if (index === delays.length - 1) {
            setRefreshScheduled(false);
          }
        }, delay);
      });
    }
  }, [uploadStatus]);

  const refreshPlayerImages = useCallback(async () => {
    if (isLoading) {
      console.log("Skipping refresh - already loading");
      return;
    }
    
    console.log("Refreshing player images to get latest data");
    
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
          processed: existingPlayerData?.processed || false,
          isUploading: false,
          error: null
        };
      });
      
      setPlayerImages(updatedPlayerImages);
      setLoadingProgress({ message: "Données actualisées", percent: 100 });
      setRefreshCounter(prev => prev + 1);
    } catch (error) {
      console.error("Error refreshing player images:", error);
      toast.error("Erreur lors de l'actualisation des données des joueurs");
    } finally {
      setIsLoading(false);
    }
  }, [playerImages, isLoading]);

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
    console.log("🚀 uploadImages called!");
    if (!bucketExists) {
      toast.error("Le bucket de stockage n'existe pas");
      return;
    }
    
    console.log("Bucket status before upload:", bucketExists ? "exists" : "does not exist");
    
    const playersWithImages = playerImages.filter(p => p.imageFile && !p.processed);
    console.log(`Found ${playersWithImages.length} players with images to upload`);
    
    if (playersWithImages.length === 0) {
      toast.info("Aucune image à télécharger");
      return;
    }
    
    setRefreshScheduled(false);
    
    setUploadStatus({
      total: playersWithImages.length,
      processed: 0,
      success: 0,
      failed: 0,
      inProgress: true
    });
    
    setPlayerImages(prev => prev.map(p => ({
      ...p,
      isUploading: p.imageFile && !p.processed ? true : p.isUploading,
      processed: false,
      error: null
    })));
    
    const uploads = playersWithImages.map(p => ({
      playerId: p.player.playerid || '',
      file: p.imageFile as File
    }));    
    
    try {
      const invalidIds = uploads.filter(upload => !upload.playerId);
      if (invalidIds.length > 0) {
        console.error("Invalid player IDs found:", invalidIds);
        toast.error(`${invalidIds.length} joueur(s) avec ID invalide`);
      }
      
      console.log("Starting upload of player images:", uploads.length);
      
      console.log("🧠 Uploading player IDs:", uploads.map(u => u.playerId));
const invalidIds = uploads.filter(upload => !upload.playerId);
console.log("❌ Invalid player IDs:", invalidIds.map(u => u.playerId));

const results = await uploadMultiplePlayerImagesWithProgress(uploads, (processed, total) => {
        console.log(`Upload progress: ${processed}/${total}`);
        setUploadStatus(prev => ({
          ...prev,
          processed
        }));
      });
      
      console.log("Upload results:", results);
      
      setPlayerImages(prev => prev.map(p => {
        const playerId = p.player.id || '';
        
        if (p.imageFile && p.isUploading) {
          const hasError = results.errors[playerId];
          
          if (hasError) {
            console.error(`Error uploading image for player ${playerId}:`, hasError);
            return {
              ...p,
              processed: true,
              isUploading: false,
              error: hasError
            };
          } else {
            console.log(`Successfully uploaded image for player ${playerId}`);
            return {
              ...p,
              processed: true,
              isUploading: false,
              error: null
            };
          }
        }
        
        return p;
      }));
      
      setUploadStatus(prev => ({
        ...prev,
        success: results.success,
        failed: results.failed,
        inProgress: false
      }));
      
      if (results.failed === 0 && results.success > 0) {
        toast.success(`${results.success} image${results.success > 1 ? 's' : ''} téléchargée${results.success > 1 ? 's' : ''} avec succès`);
        
        refreshPlayerImages();
      } else if (results.success > 0 && results.failed > 0) {
        toast.error(`${results.success} image${results.success > 1 ? 's' : ''} téléchargée${results.success > 1 ? 's' : ''}, ${results.failed} échec${results.failed > 1 ? 's' : ''}`);
      } else if (results.failed > 0 && results.success === 0) {
        toast.error(`Échec du téléchargement de ${results.failed} image${results.failed > 1 ? 's' : ''}`);
      }
      
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
  }, [playerImages, refreshPlayerImages]);

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
    refreshPlayerImages,
    refreshCounter
  };
};
