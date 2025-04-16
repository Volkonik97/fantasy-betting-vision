
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
  private uploadTimeoutMs: number = 60000;
  private bucketName: string = 'player-images';

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
    
    const batchSize = 3;
    const batches = Math.ceil(playersToUpdate.length / batchSize);
    
    for (let batch = 0; batch < batches; batch++) {
      const batchStart = batch * batchSize;
      const batchEnd = Math.min(batchStart + batchSize, playersToUpdate.length);
      const currentBatch = playersToUpdate.slice(batchStart, batchEnd);
      
      const batchPromises = currentBatch.map(playerData => this.processPlayerImage(
        playerData, 
        updatedPlayerImages, 
        successCount, 
        errorCount, 
        lastErrorMessage
      ));
      
      const results = await Promise.all(batchPromises);
      
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
      toast.success(`${successCount} images de joueurs téléchargées avec succès`);
    }
    
    if (errorCount > 0) {
      toast.error(`${errorCount} images n'ont pas pu être téléchargées`);
    }
  }
  
  private async processPlayerImage(
    playerData: PlayerWithImage,
    updatedPlayerImages: PlayerWithImage[],
    successCount: number,
    errorCount: number,
    lastErrorMessage: string | null
  ): Promise<{ success: boolean; error: boolean; errorMessage: string | null }> {
    try {
      if (!playerData.imageFile) {
        return { success: false, error: false, errorMessage: null };
      }
      
      const playerId = playerData.player.id;
      const file = playerData.imageFile;
      
      const fileName = `${playerId}_${Date.now()}.${file.name.split('.').pop()}`;
      
      console.log(`Uploading file ${fileName} to ${this.bucketName} bucket for player ${playerId}`);
      
      const { error: bucketError } = await supabase.storage.from(this.bucketName).list('', { limit: 1 });
      
      if (bucketError) {
        console.error("Error accessing bucket before upload:", bucketError);
        return { 
          success: false, 
          error: true, 
          errorMessage: `Erreur d'accès au bucket: ${bucketError.message}` 
        };
      }
      
      let fileToUpload = file;
      if (file.size > 2 * 1024 * 1024) {
        try {
          fileToUpload = await this.compressImage(file);
        } catch (compressionError) {
          console.warn("Failed to compress image, proceeding with original:", compressionError);
        }
      }
      
      try {
        const timeoutPromise = new Promise<{ data: null, error: Error }>((_, reject) => {
          setTimeout(() => {
            reject(new Error("Délai d'attente dépassé lors de l'upload. Vérifiez votre connexion internet."));
          }, this.uploadTimeoutMs);
        });
        
        const uploadPromise = supabase.storage
          .from(this.bucketName)
          .upload(fileName, fileToUpload, {
            cacheControl: '3600',
            upsert: true
          });
          
        const result = await Promise.race([uploadPromise, timeoutPromise]);
        
        if (result.error) {
          console.error("Error uploading image:", result.error);
          
          let errorMsg = result.error.message;
          if (errorMsg?.includes("violates row-level security policy")) {
            errorMsg = "Erreur de politique de sécurité RLS. Vérifiez les permissions du bucket.";
          }
          
          return { success: false, error: true, errorMessage: errorMsg };
        }
        
        console.log("Upload successful, data:", result.data);
        
        const { data: { publicUrl } } = supabase
          .storage
          .from(this.bucketName)
          .getPublicUrl(fileName);
        
        console.log(`Public URL for player ${playerId}: ${publicUrl}`);
        
        const { error: updateError } = await supabase
          .from('players')
          .update({ image: publicUrl })
          .eq('playerid', playerId);
        
        if (updateError) {
          console.error("Error updating player:", updateError);
          return { 
            success: false, 
            error: true, 
            errorMessage: `Erreur lors de la mise à jour du joueur: ${updateError.message}` 
          };
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
        
        return { success: true, error: false, errorMessage: null };
      } catch (error) {
        return { 
          success: false, 
          error: true, 
          errorMessage: error instanceof Error ? error.message : String(error) 
        };
      }
    } catch (error) {
      console.error("Error processing player image:", error);
      return { 
        success: false, 
        error: true, 
        errorMessage: error instanceof Error ? error.message : String(error) 
      };
    }
  }
  
  private async compressImage(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        const maxDimension = 1200;
        if (width > height && width > maxDimension) {
          height = Math.round(height * (maxDimension / width));
          width = maxDimension;
        } else if (height > maxDimension) {
          width = Math.round(width * (maxDimension / height));
          height = maxDimension;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        const fileType = file.type || 'image/jpeg';
        const quality = 0.8;
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Failed to create blob from canvas"));
              return;
            }
            
            const compressedFile = new File(
              [blob], 
              file.name, 
              { type: fileType }
            );
            
            console.log(`Compressed image from ${file.size} to ${compressedFile.size} bytes`);
            resolve(compressedFile);
          },
          fileType,
          quality
        );
      };
      
      img.onerror = () => {
        reject(new Error("Failed to load image for compression"));
      };
    });
  }
}

export default ImageUploadManager;
