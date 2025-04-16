
import React from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PlayerWithImage } from "./types";

interface ImageUploadManagerProps {
  setIsUploading: (isUploading: boolean) => void;
  setUploadProgress: (progress: number) => void;
  setUploadErrors: (errors: { count: number, lastError: string | null }) => void;
  setPlayerImages: (images: PlayerWithImage[]) => void;
}

class ImageUploadManager {
  private isUploading: boolean = false;
  private uploadProgress: number = 0;
  private setIsUploading: (isUploading: boolean) => void;
  private setUploadProgress: (progress: number) => void;
  private setUploadErrors: (errors: { count: number, lastError: string | null }) => void;
  private setPlayerImages: (images: PlayerWithImage[]) => void;

  constructor(props: ImageUploadManagerProps) {
    this.setIsUploading = props.setIsUploading;
    this.setUploadProgress = props.setUploadProgress;
    this.setUploadErrors = props.setUploadErrors;
    this.setPlayerImages = props.setPlayerImages;
  }

  get isUploadingState(): boolean {
    return this.isUploading;
  }

  get uploadProgressState(): number {
    return this.uploadProgress;
  }

  async uploadImages(playerImages: PlayerWithImage[], bucketExists: boolean | null): Promise<void> {
    if (!bucketExists) {
      toast.error("Le bucket de stockage n'est pas accessible. Impossible de télécharger les images.");
      return;
    }
    
    this.setUploadErrors({ count: 0, lastError: null });
    this.isUploading = true;
    this.setIsUploading(true);
    this.uploadProgress = 0;
    this.setUploadProgress(0);
    
    const playersToUpdate = playerImages.filter(p => p.imageFile !== null);
    let processed = 0;
    const total = playersToUpdate.length;
    
    if (total === 0) {
      toast.info("Aucune image à télécharger");
      this.isUploading = false;
      this.setIsUploading(false);
      return;
    }
    
    const updatedPlayerImages = [...playerImages];
    let successCount = 0;
    let errorCount = 0;
    let lastErrorMessage = null;
    
    for (const playerData of playersToUpdate) {
      try {
        if (!playerData.imageFile) continue;
        
        const playerId = playerData.player.id;
        const file = playerData.imageFile;
        
        const fileName = `${playerId}_${Date.now()}.${file.name.split('.').pop()}`;
        
        console.log(`Uploading file ${fileName} to player-images bucket for player ${playerId}`);
        
        const { error: bucketError } = await supabase.storage.from('player-images').list('', { limit: 1 });
        
        if (bucketError) {
          console.error("Error accessing bucket before upload:", bucketError);
          toast.error("Erreur d'accès au bucket de stockage. Vérifiez les permissions.");
          errorCount++;
          lastErrorMessage = bucketError.message;
          continue;
        }
        
        const uploadPromise = supabase.storage.from('player-images').upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });
        
        const uploadTimeout = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Upload timeout")), 30000);
        });
        
        const { data: uploadData, error: uploadError } = await Promise.race([
          uploadPromise,
          uploadTimeout.then(() => ({ data: null, error: new Error("Upload timeout") }))
        ]) as any;
        
        if (uploadError) {
          console.error("Error uploading image:", uploadError);
          
          if (uploadError.message?.includes("violates row-level security policy")) {
            lastErrorMessage = "Erreur de politique de sécurité RLS. Vérifiez les permissions du bucket.";
          } else {
            lastErrorMessage = uploadError.message;
          }
          
          errorCount++;
          continue;
        }
        
        console.log("Upload successful, data:", uploadData);
        
        const { data: { publicUrl } } = supabase
          .storage
          .from('player-images')
          .getPublicUrl(fileName);
        
        console.log(`Public URL for player ${playerId}: ${publicUrl}`);
        
        const { error: updateError } = await supabase
          .from('players')
          .update({ image: publicUrl })
          .eq('playerid', playerId);
        
        if (updateError) {
          console.error("Error updating player:", updateError);
          toast.error(`Erreur lors de la mise à jour du joueur ${playerData.player.name}`);
          errorCount++;
          lastErrorMessage = updateError.message;
          continue;
        }
        
        console.log(`Updated player ${playerData.player.name} with new image URL: ${publicUrl}`);
        
        const playerIndex = updatedPlayerImages.findIndex(p => p.player.id === playerId);
        if (playerIndex !== -1) {
          updatedPlayerImages[playerIndex] = {
            ...updatedPlayerImages[playerIndex],
            processed: true,
            player: {
              ...updatedPlayerImages[playerIndex].player,
              image: publicUrl
            }
          };
        }

        successCount++;
        
      } catch (error) {
        console.error("Error processing player image:", error);
        errorCount++;
        lastErrorMessage = error instanceof Error ? error.message : String(error);
      } finally {
        processed++;
        this.uploadProgress = Math.round((processed / total) * 100);
        this.setUploadProgress(this.uploadProgress);
      }
    }
    
    if (errorCount > 0) {
      this.setUploadErrors({
        count: errorCount,
        lastError: lastErrorMessage
      });
    }
    
    this.setPlayerImages(updatedPlayerImages);
    this.isUploading = false;
    this.setIsUploading(false);
    
    if (successCount > 0) {
      toast.success(`${successCount} images de joueurs téléchargées avec succès`);
    }
    
    if (errorCount > 0) {
      toast.error(`${errorCount} images n'ont pas pu être téléchargées`);
    }
  }
}

export default ImageUploadManager;
