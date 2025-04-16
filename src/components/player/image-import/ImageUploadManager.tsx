
import React from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PlayerWithImage } from "./types";
import { compressImage } from "@/utils/database/teams/images/uploader";

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
  private bucketName: string = 'player-images';

  constructor(props: ImageUploadManagerProps) {
    this.setIsUploading = props.setIsUploading;
    this.setUploadProgress = props.setUploadProgress;
    this.setUploadErrors = props.setUploadErrors;
    this.setPlayerImages = props.setPlayerImages;
  }

  async uploadImages(playerImages: PlayerWithImage[], bucketExists: boolean | null): Promise<void> {
    if (!bucketExists) {
      toast.error("Storage bucket not accessible. Cannot upload images.");
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
      toast.info("No images to upload");
      this.isUploading = false;
      this.setIsUploading(false);
      return;
    }
    
    const updatedPlayerImages = [...playerImages];
    let successCount = 0;
    let errorCount = 0;
    let lastErrorMessage = null;
    
    // Process players in batches of 3 to limit concurrent uploads
    const batchSize = 3;
    const batches = Math.ceil(playersToUpdate.length / batchSize);
    
    for (let batch = 0; batch < batches; batch++) {
      const batchStart = batch * batchSize;
      const batchEnd = Math.min(batchStart + batchSize, playersToUpdate.length);
      const currentBatch = playersToUpdate.slice(batchStart, batchEnd);
      
      // Process each player in the current batch
      const batchPromises = currentBatch.map(playerData => 
        this.uploadPlayerImage(playerData, updatedPlayerImages)
      );
      
      const results = await Promise.all(batchPromises);
      
      // Update progress and counts
      results.forEach(result => {
        processed++;
        if (result.success) successCount++;
        if (result.error) {
          errorCount++;
          lastErrorMessage = result.errorMessage;
        }
        
        this.uploadProgress = Math.round((processed / total) * 100);
        this.setUploadProgress(this.uploadProgress);
      });
      
      // Small delay between batches
      if (batch < batches - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
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
      toast.success(`${successCount} player images uploaded successfully`);
    }
    
    if (errorCount > 0) {
      toast.error(`${errorCount} images failed to upload`);
    }
  }
  
  private async uploadPlayerImage(
    playerData: PlayerWithImage,
    updatedPlayerImages: PlayerWithImage[]
  ): Promise<{ success: boolean; error: boolean; errorMessage: string | null }> {
    try {
      if (!playerData.imageFile) {
        return { success: false, error: false, errorMessage: null };
      }
      
      const playerId = playerData.player.id;
      const file = playerData.imageFile;
      
      // Ensure consistent filename with playerid prefix
      const fileExtension = file.name.split('.').pop() || 'webp';
      const fileName = `playerid${playerId}.${fileExtension}`;
      
      // Compress large images
      let fileToUpload = file;
      if (file.size > 2 * 1024 * 1024) {
        try {
          fileToUpload = await compressImage(file);
        } catch (compressionError) {
          console.warn("Failed to compress image, using original");
        }
      }
      
      // Upload the file
      const { error: uploadError } = await supabase
        .storage
        .from(this.bucketName)
        .upload(fileName, fileToUpload, {
          cacheControl: '3600',
          upsert: true // Replace existing file if any
        });
      
      if (uploadError) {
        console.error("Error uploading image:", uploadError);
        return { 
          success: false, 
          error: true, 
          errorMessage: uploadError.message
        };
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase
        .storage
        .from(this.bucketName)
        .getPublicUrl(fileName);
      
      // Update player record in database
      const { error: updateError } = await supabase
        .from('players')
        .update({ image: publicUrl })
        .eq('playerid', playerId);
      
      if (updateError) {
        console.error("Error updating player:", updateError);
        return { 
          success: false, 
          error: true, 
          errorMessage: `Database update error: ${updateError.message}`
        };
      }
      
      // Update local state
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
      
      return { success: true, error: false, errorMessage: null };
    } catch (error) {
      console.error("Error processing player image:", error);
      return { 
        success: false, 
        error: true, 
        errorMessage: error instanceof Error ? error.message : String(error)
      };
    }
  }
}

export default ImageUploadManager;
