
import { useState, useEffect, useCallback } from "react";
import { PlayerWithImage, UploadStatus } from "./types";
import { Player } from "@/utils/models/types";
import { loadAllPlayersInBatches } from "@/services/playerService";
import { uploadMultiplePlayerImagesWithProgress } from "@/utils/database/teams/images/uploader";
import { toast } from "sonner";

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

  // Load player data
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

  // Handle file selection from drag-and-drop or file picker
  const handleFileSelect = useCallback((files: File[]) => {
    if (!files.length) return;
    
    // Create a copy of the current player images
    const updatedPlayerImages = [...playerImages];
    const unmatchedFiles: File[] = [];
    
    // Process each file
    files.forEach(file => {
      // Try to match file name with player name
      const fileName = file.name.toLowerCase().replace(/\.[^/.]+$/, ""); // Remove extension
      const matchedPlayerIndex = updatedPlayerImages.findIndex(
        p => p.player.name.toLowerCase().includes(fileName) || 
             fileName.includes(p.player.name.toLowerCase())
      );
      
      if (matchedPlayerIndex !== -1) {
        // File matched to a player
        const playerImage = updatedPlayerImages[matchedPlayerIndex];
        
        // Only assign if player doesn't already have a file or the new file is bigger (presumably better quality)
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
        // No match found, add to unmatched list
        unmatchedFiles.push(file);
      }
    });
    
    setPlayerImages(updatedPlayerImages);
    setUnmatched(prev => [...prev, ...unmatchedFiles]);
    
    toast.success(`${files.length} images importées, ${unmatchedFiles.length} non associées`);
  }, [playerImages]);

  // Assign a file to a player manually
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

  // Upload all images
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
    
    // Mark players as uploading
    setPlayerImages(prev => prev.map(p => ({
      ...p,
      isUploading: p.imageFile && !p.processed ? true : p.isUploading
    })));
    
    // Prepare uploads
    const uploads = playersWithImages.map(p => ({
      playerId: p.player.id || p.player.playerid,
      file: p.imageFile as File
    }));
    
    try {
      const results = await uploadMultiplePlayerImagesWithProgress(uploads, (processed, total) => {
        setUploadStatus(prev => ({
          ...prev,
          processed
        }));
      });
      
      // Update player states based on results
      setPlayerImages(prev => prev.map(p => {
        const playerId = p.player.id || p.player.playerid;
        
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
    } catch (error) {
      console.error("Upload error:", error);
      
      // Mark all as failed
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
    setFilterTab
  };
};
