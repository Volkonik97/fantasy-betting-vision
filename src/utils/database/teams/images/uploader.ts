
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UploadResult {
  success: boolean;
  publicUrl?: string;
  error?: string;
}

/**
 * Compresse une image avant de l'uploader pour réduire sa taille
 */
export const compressImage = async (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      // Calculer les nouvelles dimensions en maintenant le ratio
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
        reject(new Error("Impossible d'obtenir le contexte du canvas"));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Obtenir l'extension du fichier
      const fileType = file.type || 'image/jpeg';
      const quality = 0.8; // 80% de qualité
      
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Échec de la création du blob depuis le canvas"));
            return;
          }
          
          const compressedFile = new File(
            [blob], 
            file.name, 
            { type: fileType }
          );
          
          console.log(`Image compressée de ${file.size} à ${compressedFile.size} octets`);
          resolve(compressedFile);
        },
        fileType,
        quality
      );
    };
    
    img.onerror = () => {
      reject(new Error("Échec du chargement de l'image pour la compression"));
    };
  });
};

/**
 * Upload une image vers Supabase Storage
 */
export const uploadPlayerImage = async (
  playerId: string, 
  file: File, 
  timeout: number = 30000
): Promise<UploadResult> => {
  try {
    console.log(`Téléchargement d'image pour le joueur ${playerId}`);
    
    // Vérifier l'accès au bucket avant l'upload
    const { error: bucketError } = await supabase.storage.from('player-images').list('', { limit: 1 });
    
    if (bucketError) {
      console.error("Erreur d'accès au bucket:", bucketError);
      return { 
        success: false, 
        error: `Erreur d'accès au bucket: ${bucketError.message}` 
      };
    }
    
    // Comprimer l'image si elle est trop grande
    let fileToUpload = file;
    if (file.size > 2 * 1024 * 1024) { // > 2MB
      try {
        fileToUpload = await compressImage(file);
      } catch (compressionError) {
        console.warn("Échec de la compression, utilisation de l'original:", compressionError);
      }
    }
    
    // Créer un nom de fichier unique
    const fileName = `${playerId}_${Date.now()}.${file.name.split('.').pop()}`;
    
    try {
      // Configurer une promesse de timeout
      const timeoutPromise = new Promise<{ data: null, error: Error }>((_, reject) => {
        setTimeout(() => {
          reject(new Error("Délai d'attente dépassé lors du téléchargement. Vérifiez votre connexion internet."));
        }, timeout);
      });
      
      // Lancer l'upload
      const uploadPromise = supabase.storage
        .from('player-images')
        .upload(fileName, fileToUpload, {
          cacheControl: '3600',
          upsert: true
        });
        
      // Course entre l'upload et le timeout
      const result = await Promise.race([uploadPromise, timeoutPromise]);
      
      if (result.error) {
        console.error("Erreur lors du téléchargement:", result.error);
        
        let errorMsg = result.error.message || "Erreur inconnue";
        if (errorMsg.includes("violates row-level security policy")) {
          errorMsg = "Erreur de politique de sécurité RLS. Vérifiez les permissions du bucket.";
        }
        
        return { success: false, error: errorMsg };
      }
      
      // Obtenir l'URL publique
      const { data: { publicUrl } } = supabase.storage.from('player-images').getPublicUrl(fileName);
      
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
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { 
      success: false,
      error: errorMessage
    };
  }
};

/**
 * Met à jour la référence d'image d'un joueur dans la base de données
 */
export const updatePlayerImageReference = async (playerId: string, imageUrl: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('players')
      .update({ image: imageUrl })
      .eq('playerid', playerId);
    
    if (error) {
      console.error("Erreur lors de la mise à jour du joueur:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la référence d'image:", error);
    return false;
  }
};
