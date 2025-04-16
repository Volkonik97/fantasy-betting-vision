
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
  file: File,
  timeout: number = 30000 // Default timeout of 30 seconds
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
    
    console.log(`Uploading image for player ${playerId} with filename ${fileName}`);
    
    // Upload the file with upsert to replace any existing file
    const { error: uploadError } = await supabase
      .storage
      .from('player-images')
      .upload(fileName, fileToUpload, {
        cacheControl: '3600',
        upsert: true // Overwrite if exists
      });
    
    if (uploadError) {
      console.error("Upload error:", uploadError);
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
    
    console.log(`Successfully uploaded image for player ${playerId}, URL: ${publicUrl}`);
    
    return { 
      success: true,
      publicUrl
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error in uploadPlayerImage:", errorMessage);
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
    console.log(`Updating image reference for player ${playerId} with URL ${imageUrl}`);
    
    const { error } = await supabase
      .from('players')
      .update({ image: imageUrl })
      .eq('playerid', playerId);
    
    if (error) {
      console.error("Error updating player image reference:", error);
      return false;
    }
    
    console.log(`Successfully updated image reference for player ${playerId}`);
    return true;
  } catch (error) {
    console.error("Error updating player image reference:", error);
    return false;
  }
};

/**
 * Upload multiple player images with concurrency control
 * @param uploads Array of player ID and file pairs to upload
 * @param concurrencyLimit Maximum number of concurrent uploads (default: 3)
 * @returns Object containing success count, failure count, and errors by player ID
 */
export const uploadMultiplePlayerImages = async (
  uploads: { playerId: string; file: File }[],
  concurrencyLimit: number = 3
): Promise<{ success: number; failed: number; errors: Record<string, string> }> => {
  const results = {
    success: 0,
    failed: 0,
    errors: {} as Record<string, string>
  };
  
  // Sort uploads by file size (smallest first) for better efficiency
  const sortedUploads = [...uploads].sort((a, b) => a.file.size - b.file.size);
  
  // Process uploads in batches to control concurrency
  for (let i = 0; i < sortedUploads.length; i += concurrencyLimit) {
    const batch = sortedUploads.slice(i, i + concurrencyLimit);
    
    // Process each batch concurrently
    const batchPromises = batch.map(async ({ playerId, file }) => {
      try {
        // Upload the image
        const result = await uploadPlayerImage(playerId, file);
        
        if (!result.success) {
          results.failed++;
          results.errors[playerId] = result.error || "Unknown error";
          return { success: false };
        }
        
        // Update the database reference
        const updateSuccess = await updatePlayerImageReference(playerId, result.publicUrl!);
        
        if (!updateSuccess) {
          results.failed++;
          results.errors[playerId] = "Failed to update database reference";
          return { success: false };
        }
        
        results.success++;
        return { success: true };
      } catch (error) {
        results.failed++;
        results.errors[playerId] = error instanceof Error ? error.message : String(error);
        return { success: false };
      }
    });
    
    // Wait for the current batch to complete
    await Promise.all(batchPromises);
    
    // Small delay between batches to prevent overwhelming the server
    if (i + concurrencyLimit < sortedUploads.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  return results;
};

/**
 * Upload multiple player images with progress tracking
 */
export const uploadMultiplePlayerImagesWithProgress = async (
  uploads: { playerId: string; file: File }[],
  progressCallback: (processed: number, total: number) => void
): Promise<{ success: number; failed: number; errors: Record<string, string> }> => {
  const results = {
    success: 0,
    failed: 0,
    errors: {} as Record<string, string>
  };
  
  const total = uploads.length;
  let processed = 0;
  
  // Process each upload sequentially for better progress tracking
  for (const { playerId, file } of uploads) {
    try {
      // Upload the image
      const result = await uploadPlayerImage(playerId, file);
      
      if (!result.success) {
        results.failed++;
        results.errors[playerId] = result.error || "Unknown error";
      } else {
        // Update the database reference
        const updateSuccess = await updatePlayerImageReference(playerId, result.publicUrl!);
        
        if (!updateSuccess) {
          results.failed++;
          results.errors[playerId] = "Failed to update database reference";
        } else {
          results.success++;
        }
      }
    } catch (error) {
      results.failed++;
      results.errors[playerId] = error instanceof Error ? error.message : String(error);
    }
    
    processed++;
    progressCallback(processed, total);
  }
  
  return results;
};
