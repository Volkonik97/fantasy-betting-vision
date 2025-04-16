
import { supabase } from "@/integrations/supabase/client";

/**
 * Check if an image URL is accessible in the Supabase storage or as an external URL
 * @param imageUrl The full URL of the image to check
 * @returns Boolean indicating if the image is accessible
 */
export const verifyImageExists = async (imageUrl: string): Promise<boolean> => {
  if (!imageUrl) return false;
  
  try {
    console.log(`Verifying image URL: ${imageUrl}`);
    
    // Pour les images dans le dossier public (lovable-uploads)
    if (imageUrl.includes('/lovable-uploads/')) {
      console.log(`Image dans lovable-uploads: ${imageUrl}`);
      return true; // Ces images sont dans le dossier public
    }
    
    // Pour les URLs externes absolues (non Supabase storage)
    if (imageUrl.startsWith('http') && !imageUrl.includes('supabase.co/storage')) {
      console.log(`URL d'image externe: ${imageUrl}`);
      
      try {
        const response = await fetch(imageUrl, { 
          method: 'HEAD',
          // Ajouter un timeout pour éviter les longues attentes
          signal: AbortSignal.timeout(5000)
        });
        const exists = response.ok;
        console.log(`Image externe accessible: ${exists}`);
        return exists;
      } catch (error) {
        console.error(`Erreur lors de la vérification de l'image externe: ${error}`);
        return false;
      }
    }
    
    // For Supabase URLs, make sure we're using the correct bucket name
    const bucketName = 'Player Images';
    
    // Pour les URLs directes depuis storage.supabase.co ou dtddoxxazhmfudrvpszu.supabase.co
    if ((imageUrl.includes('supabase.co/storage') || imageUrl.includes('storage.supabase.co')) && imageUrl.includes(bucketName)) {
      console.log(`URL de stockage direct depuis ${bucketName}: ${imageUrl}`);
      
      // Extraire le chemin du fichier depuis l'URL
      let filePath = '';
      const regex = new RegExp(`${bucketName}\\/([^?]+)`);
      const match = imageUrl.match(regex);
      
      if (match && match[1]) {
        filePath = decodeURIComponent(match[1]);
        console.log(`Chemin du fichier extrait: ${filePath}`);
        
        // Vérifier si le fichier existe dans le bucket
        const { data, error } = await supabase
          .storage
          .from(bucketName)
          .download(filePath);
        
        if (error) {
          console.error(`Fichier non trouvé dans le bucket ${bucketName}: ${error.message}`);
          return false;
        }
        
        console.log(`Fichier existe dans le bucket ${bucketName}`);
        return true;
      } else {
        console.error(`Impossible d'extraire le chemin du fichier depuis l'URL: ${imageUrl}`);
        return false;
      }
    }
    
    // Pour les noms de fichiers simples - vérifier directement dans le bucket
    if (!imageUrl.includes('/') && !imageUrl.startsWith('http')) {
      console.log(`Vérification du nom de fichier simple dans le bucket ${bucketName}: ${imageUrl}`);
      
      try {
        const { data, error } = await supabase
          .storage
          .from(bucketName)
          .download(imageUrl);
        
        if (error) {
          console.error(`Fichier non trouvé dans le bucket ${bucketName}: ${error.message}`);
          return false;
        }
        
        console.log(`Fichier existe dans le bucket ${bucketName}`);
        return true;
      } catch (storageError) {
        console.error(`Erreur lors de l'accès au stockage: ${storageError}`);
        return false;
      }
    }
    
    console.log(`Format d'image inconnu, impossible de vérifier: ${imageUrl}`);
    return false;
  } catch (error) {
    console.error("Erreur lors de la vérification de l'image:", error);
    return false;
  }
};
