import { supabase } from "@/integrations/supabase/client";

/**
 * Compress an image before uploading to reduce its size
 */
export const compressImage = async (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement("canvas");
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

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      const fileType = file.type || "image/jpeg";
      const quality = 0.8;

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Failed to create blob from canvas"));
            return;
          }

          const compressedFile = new File([blob], file.name, {
            type: fileType,
          });

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
 * Upload an image to Supabase Storage and update DB
 */
export const uploadPlayerImage = async (
  playerId: string,
  file: File,
  timeout: number = 30000
): Promise<{ success: boolean; publicUrl?: string; error?: string }> => {
  try {
    if (!playerId || playerId.trim() === "") {
      console.error("❌ ID de joueur non valide :", playerId);
      return { success: false, error: "ID de joueur non valide" };
    }

    const cleanPlayerId = playerId.replace(/[^a-zA-Z0-9-_]/g, "");
    const fileName = `playerid${cleanPlayerId}.png`;

    const { error: bucketError } = await supabase.storage
      .from("player-images")
      .list("", { limit: 1 });

    if (bucketError) {
      console.error("Bucket access error:", bucketError);
      return { success: false, error: "Erreur d'accès au bucket" };
    }

    let fileToUpload = file;
    if (file.size > 2 * 1024 * 1024) {
      try {
        fileToUpload = await compressImage(file);
      } catch (compressionError) {
        console.warn("Compression failed, using original file");
      }
    }

    const fileBuffer = await fileToUpload.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from("player-images")
      .upload(fileName, fileBuffer, {
        cacheControl: "0",
        upsert: true,
        contentType: "image/png",
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return { success: false, error: uploadError.message };
    }

    const { data } = supabase.storage
      .from("player-images")
      .getPublicUrl(fileName);

    const publicUrlWithTimestamp = `${data.publicUrl}?t=${Date.now()}`;

    const { error: dbError } = await supabase
      .from("players")
      .update({ image: publicUrlWithTimestamp })
      .eq("playerid", playerId);

    if (dbError) {
      console.error("Erreur mise à jour image joueur :", dbError);
      return { success: false, error: dbError.message };
    }

    return { success: true, publicUrl: publicUrlWithTimestamp };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
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
    errors: {} as Record<string, string>,
  };

  const total = uploads.length;
  let processed = 0;

  const validUploads = uploads.filter((u) => u.playerId && u.file);

  for (const { playerId, file } of validUploads) {
    const result = await uploadPlayerImage(playerId, file);

    if (result.success) {
      results.success++;
    } else {
      results.failed++;
      results.errors[playerId] = result.error || "Erreur inconnue";
    }

    processed++;
    progressCallback(processed, total);
  }

  return results;
};
