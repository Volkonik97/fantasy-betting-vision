
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
      
      // Get the file type
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
    // Vérifier que l'ID du joueur n'est pas vide
    if (!playerId || playerId.trim() === '') {
      console.error("Invalid player ID:", playerId);
      return { 
        success: false, 
        error: "ID de joueur non valide" 
      };
    }
    
    // Clean the player ID to prevent URL encoding issues
    const cleanPlayerId = playerId.replace(/[^a-zA-Z0-9-_]/g, '');
    
    // Log the bucket access attempt
    console.log(`Attempting to upload image for player ${cleanPlayerId} to bucket 'player-images'`);
    
    // Check bucket access before upload
    const { data: bucketCheck, error: bucketError } = await supabase
      .storage
      .from('player-images')
      .list('', { limit: 1 });
    
    if (bucketError) {
      console.error("Bucket access error:", bucketError);
      return { 
        success: false, 
        error: `Erreur d'accès au bucket: ${bucketError.message}` 
      };
    }
    
    console.log("Bucket access successful:", bucketCheck);
    
    // Compress the image if it's large
    let fileToUpload = file;
    if (file.size > 2 * 1024 * 1024) { // > 2MB
      try {
        console.log(`Compressing large image (${file.size} bytes)`);
        fileToUpload = await compressImage(file);
        console.log(`Compressed to ${fileToUpload.size} bytes`);
      } catch (compressionError) {
        console.warn("Compression failed, using original file:", compressionError);
      }
    }
    
    // IMPORTANT: Use a consistent file naming convention - always use .png extension
    // This makes it easier to verify and locate files
    const fileName = `playerid${cleanPlayerId}.png`;
    
    console.log(`Uploading image for player ${cleanPlayerId} with filename ${fileName}`);
    
    // Upload the file with upsert to replace any existing file
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('player-images')
      .upload(fileName, fileToUpload, {
        cacheControl: 'max-age=0', // Prevent caching completely
        upsert: true // Overwrite if exists
      });
    
    if (uploadError) {
      console.error("Upload error:", uploadError);
      return { 
        success: false, 
        error: uploadError.message 
      };
    }
    
    console.log("Upload successful:", uploadData);
    
    // Get the public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('player-images')
      .getPublicUrl(fileName);
    
    // Add cache buster to URL
    const publicUrlWithCacheBuster = `${publicUrl}?t=${Date.now()}`;
    
    console.log(`Successfully uploaded image for player ${cleanPlayerId}, URL: ${publicUrlWithCacheBuster}`);
    
    return { 
      success: true,
      publicUrl: publicUrlWithCacheBuster
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
    
    if (!playerId || playerId.trim() === '') {
      console.error("Invalid player ID for database update:", playerId);
      return false;
    }
    
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
  
  console.log(`Starting batch upload of ${total} player images`);
  
  // Process each upload sequentially for better progress tracking
  for (const { playerId, file } of uploads) {
    try {
      console.log(`Processing upload for player ${playerId}`);
      
      if (!playerId || playerId.trim() === '') {
        processed++;
        results.failed++;
        results.errors[playerId || 'unknown'] = "ID de joueur non valide";
        progressCallback(processed, total);
        console.error("Skipping upload due to invalid player ID");
        continue;
      }
      
      // Upload the image
      const result = await uploadPlayerImage(playerId, file);
      
      if (!result.success) {
        results.failed++;
        results.errors[playerId] = result.error || "Erreur inconnue";
        console.error(`Failed to upload image for player ${playerId}: ${result.error}`);
      } else {
        // Update the database reference
        const updateSuccess = await updatePlayerImageReference(playerId, result.publicUrl!);
        
        if (!updateSuccess) {
          results.failed++;
          results.errors[playerId] = "Échec de la mise à jour de la référence dans la base de données";
          console.error(`Failed to update database reference for player ${playerId}`);
        } else {
          results.success++;
          console.log(`Successfully processed image for player ${playerId}`);
        }
      }
    } catch (error) {
      results.failed++;
      results.errors[playerId] = error instanceof Error ? error.message : String(error);
      console.error(`Unexpected error processing player ${playerId}:`, error);
    }
    
    processed++;
    progressCallback(processed, total);
  }
  
  console.log(`Batch upload complete: ${results.success} successful, ${results.failed} failed`);
  
  return results;
};
