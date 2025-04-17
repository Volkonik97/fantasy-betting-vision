
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
  if (!playerId || playerId.trim() === '') {
    console.error("❌ ID de joueur non valide :", playerId);
    return {
      success: false,
      error: "ID de joueur non valide"
    };
  }
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
    
    // Create upload abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    // Upload the file with upsert to replace any existing file
    // Using ArrayBuffer for more reliable uploads
    const fileBuffer = await fileToUpload.arrayBuffer();
    
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('player-images')
      .upload(fileName, fileBuffer, {
        cacheControl: '0', // No caching
        upsert: true, // Overwrite if exists
        contentType: 'image/png' // Force content type to be PNG
      });
    
    clearTimeout(timeoutId);
    
    if (uploadError) {
      console.error("Upload error:", uploadError);
      return { 
        success: false, 
        error: uploadError.message 
      };
    }
    
    console.log("Upload successful:", uploadData);
    
    // Get the public URL with cache buster
    const timestamp = Date.now();
    const { data: { publicUrl } } = supabase
      .storage
      .from('player-images')
      .getPublicUrl(fileName);
    
    // Add cache buster to URL
    const publicUrlWithCacheBuster = `${publicUrl}?t=${timestamp}`;
    
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
  
  // Validate and filter uploads first
  const validUploads = uploads.filter(upload => {
    if (!upload.playerId || upload.playerId.trim() === '') {
      results.failed++;
      results.errors['unknown'] = "ID de joueur manquant";
      return false;
    }
    return true;
  });
  
  // Process valid uploads in small batches (3 at a time) to prevent overwhelming the server
  const batchSize = 3;
  const batches = Math.ceil(validUploads.length / batchSize);
  
  for (let i = 0; i < batches; i++) {
    const start = i * batchSize;
    const end = Math.min(start + batchSize, validUploads.length);
    const currentBatch = validUploads.slice(start, end);
    
    console.log(`Processing batch ${i+1}/${batches} (${currentBatch.length} images)`);
    
    // Process the current batch in parallel
    const batchResults = await Promise.all(
      currentBatch.map(async ({ playerId, file }) => {
        try {
          // Upload the image
          const uploadResult = await uploadPlayerImage(playerId, file);
          
          if (!uploadResult.success) {
            console.error(`Failed to upload image for player ${playerId}: ${uploadResult.error}`);
            return {
              playerId,
              success: false,
              error: uploadResult.error || "Erreur inconnue"
            };
          }
          
          // Update the database reference
          const updateSuccess = await updatePlayerImageReference(
            playerId, 
            uploadResult.publicUrl!
          );
          
          if (!updateSuccess) {
            console.error(`Failed to update database reference for player ${playerId}`);
            return {
              playerId,
              success: false,
              error: "Échec de la mise à jour de la référence dans la base de données"
            };
          }
          
          console.log(`Successfully processed image for player ${playerId}`);
          return {
            playerId,
            success: true,
            error: null
          };
        } catch (error) {
          console.error(`Unexpected error processing player ${playerId}:`, error);
          return {
            playerId,
            success: false,
            error: error instanceof Error ? error.message : String(error)
          };
        }
      })
    );
    
    // Update results
    batchResults.forEach(result => {
      if (result.success) {
        results.success++;
      } else {
        results.failed++;
        results.errors[result.playerId] = result.error || "Erreur inconnue";
      }
      processed++;
      progressCallback(processed, total);
    });
    
    // Small delay between batches to avoid rate limiting
    if (i < batches - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  console.log(`Batch upload complete: ${results.success} successful, ${results.failed} failed`);
  
  return results;
};
