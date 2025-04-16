
import { supabase } from "@/integrations/supabase/client";

/**
 * Compress an image before uploading to reduce its size
 */
export const compressImage = async (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      // Calculate new dimensions maintaining aspect ratio
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
      
      // Get the file extension
      const fileType = file.type || 'image/jpeg';
      const quality = 0.8; // 80% quality
      
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
};

/**
 * Upload an image to Supabase Storage using a consistent naming format
 */
export const uploadPlayerImage = async (
  playerId: string, 
  file: File
): Promise<{ success: boolean; publicUrl?: string; error?: string }> => {
  try {
    // Check bucket access before upload
    const { error: bucketError } = await supabase
      .storage
      .from('player-images')
      .list('', { limit: 1 });
    
    if (bucketError) {
      return { 
        success: false, 
        error: `Bucket access error: ${bucketError.message}` 
      };
    }
    
    // Compress the image if it's large
    let fileToUpload = file;
    if (file.size > 2 * 1024 * 1024) { // > 2MB
      try {
        fileToUpload = await compressImage(file);
      } catch (compressionError) {
        console.warn("Compression failed, using original file");
      }
    }
    
    // Use a consistent filename format with playerid prefix
    // This ensures we can easily find images by player ID later
    const fileExtension = file.name.split('.').pop() || 'webp';
    const fileName = `playerid${playerId}.${fileExtension}`;
    
    // Upload the file with upsert to replace any existing file
    const { error: uploadError } = await supabase
      .storage
      .from('player-images')
      .upload(fileName, fileToUpload, {
        cacheControl: '3600',
        upsert: true // Overwrite if exists
      });
    
    if (uploadError) {
      return { 
        success: false, 
        error: uploadError.message 
      };
    }
    
    // Get the public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('player-images')
      .getPublicUrl(fileName);
    
    return { 
      success: true,
      publicUrl
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { 
      success: false,
      error: errorMessage
    };
  }
};

/**
 * Update a player's image reference in the database
 */
export const updatePlayerImageReference = async (playerId: string, imageUrl: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('players')
      .update({ image: imageUrl })
      .eq('playerid', playerId);
    
    if (error) {
      console.error("Error updating player image reference:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error updating player image reference:", error);
    return false;
  }
};
