
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
    percent: 0,
  });
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    total: 0,
    processed: 0,
    success: 0,
    failed: 0,
    inProgress: false,
  });
  const [filterTab, setFilterTab] = useState("all");
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [refreshScheduled, setRefreshScheduled] = useState(false);

  useEffect(() => {
    if (
      uploadStatus.processed > 0 &&
      uploadStatus.processed === uploadStatus.total &&
      !uploadStatus.inProgress &&
      !refreshScheduled &&
      uploadStatus.success > 0
    ) {
      console.log("Upload completed. Scheduling data refresh...");
      setRefreshScheduled(true);

      const delays = [2000, 5000, 10000, 15000];
      delays.forEach((delay, index) => {
        setTimeout(() => {
          console.log(
            `Executing scheduled refresh #${index + 1} after ${delay}ms`
          );
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

    setLoadingProgress({
      message: "Actualisation des données des joueurs...",
      percent: 50,
    });

    try {
      const players = await loadAllPlayersInBatches((progress, total) => {
        setLoadingProgress({
          message: `Actualisation des données (${progress}/${total})`,
          percent: Math.min(90, (progress / total) * 100),
        });
      });

      const updatedPlayerImages = players.map((player) => {
        const existingPlayerData = playerImages.find(
          (p) => p.player.id === player.id
        );

        return {
          player,
          imageFile: existingPlayerData?.imageFile || null,
          newImageUrl: null,
          processed: existingPlayerData?.processed || false,
          isUploading: false,
          error: null,
        };
      });

      setPlayerImages(updatedPlayerImages);
      setLoadingProgress({ message: "Données actualisées", percent: 100 });
      setRefreshCounter((prev) => prev + 1);
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
            percent: Math.min(90, (progress / total) * 100),
          });
        });

        const mappedPlayers: PlayerWithImage[] = players.map((player) => ({
          player,
          imageFile: null,
          newImageUrl: null,
          processed: false,
          isUploading: false,
          error: null,
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

  // Implement the missing handleFileSelect function
  const handleFileSelect = useCallback((files: File[]) => {
    console.log("Files selected:", files.length);
    
    if (files.length === 0) {
      return;
    }

    // Filter out non-image files
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    // Try to match files to players based on filename
    const newUnmatched: File[] = [];
    const updatedPlayers = [...playerImages];
    
    imageFiles.forEach(file => {
      const fileName = file.name.toLowerCase().replace(/\.[^/.]+$/, ""); // Remove file extension
      
      // Try to find a matching player by name (case insensitive)
      const matchedPlayerIndex = updatedPlayers.findIndex(
        p => p.player.name.toLowerCase() === fileName
      );
      
      if (matchedPlayerIndex >= 0) {
        // Match found, assign file to player
        updatedPlayers[matchedPlayerIndex] = {
          ...updatedPlayers[matchedPlayerIndex],
          imageFile: file,
          processed: false,
          error: null
        };
        console.log(`Matched file ${file.name} to player ${updatedPlayers[matchedPlayerIndex].player.name}`);
      } else {
        // No match found, add to unmatched files
        newUnmatched.push(file);
        console.log(`No player match found for file: ${file.name}`);
      }
    });
    
    setPlayerImages(updatedPlayers);
    setUnmatched(prev => [...prev, ...newUnmatched]);
    
    if (newUnmatched.length > 0) {
      toast.info(`${newUnmatched.length} fichiers n'ont pas pu être associés automatiquement`);
    }
    
    if (newUnmatched.length < imageFiles.length) {
      toast.success(`${imageFiles.length - newUnmatched.length} images associées automatiquement`);
    }
  }, [playerImages]);

  // Implement the assignFileToPlayer function
  const assignFileToPlayer = useCallback((file: File, playerId: string) => {
    console.log(`Assigning file ${file.name} to player with ID ${playerId}`);
    
    // Update player with the assigned file
    setPlayerImages(prev => 
      prev.map(p => {
        if (p.player.id === playerId) {
          return {
            ...p,
            imageFile: file,
            processed: false,
            error: null
          };
        }
        return p;
      })
    );
    
    // Remove file from unmatched list
    setUnmatched(prev => prev.filter(f => f !== file));
    
    toast.success("Image associée au joueur");
  }, []);

  const uploadImages = useCallback(
    async (bucketExists: boolean) => {
      console.log("🚀 uploadImages called!");

      console.log(
        "🧩 Raw playerImages (filtered):",
        playerImages.map((p) => ({
          name: p.player?.name,
          id: p.player?.id,
          file: p.imageFile?.name,
        }))
      );

      if (!bucketExists) {
        toast.error("Le bucket de stockage n'existe pas");
        return;
      }

      const playersWithImages = playerImages.filter(
        (p) => p.imageFile && !p.processed
      );

      const validPlayersWithImages = playersWithImages.filter(
        (p) => p.player?.id
      );

      console.log(
        "🧪 Valid players with image files:",
        validPlayersWithImages.map((p) => ({
          name: p.player?.name,
          id: p.player?.id,
          file: p.imageFile?.name,
        }))
      );

      const uploads = validPlayersWithImages.map((p) => ({
        playerId: p.player.id,
        file: p.imageFile as File,
      }));

      console.log("📦 Final uploads array:", uploads);

      const invalidIds = uploads.filter((upload) => !upload.playerId);
      console.log(
        "❌ Invalid player IDs:",
        invalidIds.map((u) => ({ id: u.playerId, file: u.file.name }))
      );

      if (uploads.length === 0) {
        toast.info("Aucune image à télécharger");
        return;
      }

      setRefreshScheduled(false);
      setUploadStatus({
        total: uploads.length,
        processed: 0,
        success: 0,
        failed: 0,
        inProgress: true,
      });

      setPlayerImages((prev) =>
        prev.map((p) => ({
          ...p,
          isUploading: p.imageFile && !p.processed ? true : p.isUploading,
          processed: false,
          error: null,
        }))
      );

      try {
        const results = await uploadMultiplePlayerImagesWithProgress(
          uploads,
          (processed, total) => {
            setUploadStatus((prev) => ({
              ...prev,
              processed,
            }));
          }
        );

        setPlayerImages((prev) =>
          prev.map((p) => {
            const playerId = p.player.id;

            if (p.imageFile && p.isUploading) {
              const hasError = results.errors[playerId];
              return {
                ...p,
                processed: true,
                isUploading: false,
                error: hasError || null,
              };
            }

            return p;
          })
        );

        setUploadStatus((prev) => ({
          ...prev,
          success: results.success,
          failed: results.failed,
          inProgress: false,
        }));

        if (results.failed === 0 && results.success > 0) {
          toast.success(`${results.success} image(s) téléchargée(s) avec succès`);
        } else if (results.success > 0 && results.failed > 0) {
          toast.error(
            `${results.success} image(s) ok, ${results.failed} échec(s)`
          );
        } else if (results.failed > 0 && results.success === 0) {
          toast.error(`Échec du téléchargement de ${results.failed} image(s)`);
        }
      } catch (error) {
        console.error("Upload error:", error);
        toast.error("Erreur lors du téléchargement des images");

        setUploadStatus((prev) => ({
          ...prev,
          failed: prev.total,
          inProgress: false,
        }));

        setPlayerImages((prev) =>
          prev.map((p) => ({
            ...p,
            isUploading: false,
            error:
              p.imageFile && !p.processed
                ? "Erreur lors du téléchargement"
                : p.error,
          }))
        );
      }
    },
    [playerImages]
  );

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
    refreshCounter,
  };
};
