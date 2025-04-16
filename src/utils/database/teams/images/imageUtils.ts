
import { supabase } from "@/integrations/supabase/client";

/**
 * Vérifie si une URL d'image est accessible dans Supabase Storage ou en externe
 */
export const verifyImageExists = async (imageUrl: string): Promise<boolean> => {
  if (!imageUrl) return false;
  
  try {
    // Pour les images dans le dossier public (lovable-uploads)
    if (imageUrl.includes('/lovable-uploads/')) {
      return true; // Ces images sont dans le dossier public
    }
    
    // Pour les URLs externes absolues (non Supabase storage)
    if (imageUrl.startsWith('http') && !imageUrl.includes('supabase.co/storage')) {
      try {
        const response = await fetch(imageUrl, { 
          method: 'HEAD',
          signal: AbortSignal.timeout(5000)
        });
        return response.ok;
      } catch (error) {
        console.error(`Erreur lors de la vérification de l'image externe: ${error}`);
        return false;
      }
    }
    
    // Pour les URLs de Supabase Storage
    if (imageUrl.includes('supabase.co/storage')) {
      console.log(`Vérification de l'URL Supabase: ${imageUrl}`);
      
      // Extraire le bucket et le chemin du fichier depuis l'URL
      const storageUrlPattern = /storage\/v1\/object\/public\/([^/]+)\/([^?]+)/;
      const match = imageUrl.match(storageUrlPattern);
      
      if (match && match[1] && match[2]) {
        const bucketName = match[1];
        const filePath = decodeURIComponent(match[2]);
        
        console.log(`Bucket: ${bucketName}, FilePath: ${filePath}`);
        
        // Essayer de vérifier que le fichier existe dans le bucket
        try {
          const { data, error } = await supabase
            .storage
            .from(bucketName)
            .download(filePath);
          
          if (error) {
            console.error(`Erreur lors de la vérification du fichier ${filePath} dans le bucket ${bucketName}:`, error);
            return false;
          }
          
          return true;
        } catch (downloadError) {
          console.error(`Erreur lors du téléchargement depuis Supabase:`, downloadError);
          return false;
        }
      }
    }
    
    // Pour les noms de fichiers simples
    if (!imageUrl.includes('/') && !imageUrl.startsWith('http')) {
      try {
        // Essayer avec le bucket player-images
        const { data, error } = await supabase
          .storage
          .from('player-images')
          .download(imageUrl);
        
        if (!error) {
          return true;
        }
      } catch (storageError) {
        console.error(`Erreur lors de l'accès au stockage pour ${imageUrl}:`, storageError);
      }
    }
    
    console.log(`Format d'image non reconnu: ${imageUrl}`);
    return false;
  } catch (error) {
    console.error("Erreur lors de la vérification de l'image:", error);
    return false;
  }
};

/**
 * Normalise une URL d'image pour s'assurer qu'elle est utilisable
 */
export const normalizeImageUrl = (imageUrl: string | null | undefined): string | null => {
  if (!imageUrl) return null;
  
  // Nettoyer les espaces
  const cleanUrl = imageUrl.trim();
  
  // Si c'est déjà une URL Supabase Storage complète, la retourner telle quelle
  if (cleanUrl.includes('supabase.co/storage')) {
    console.log(`URL Supabase normalisée: ${cleanUrl}`);
    return cleanUrl;
  }
  
  // Si c'est une URL absolue, la retourner telle quelle
  if (cleanUrl.startsWith('http')) {
    return cleanUrl;
  }
  
  // Si c'est un chemin relatif vers le dossier public, ajouter un / au début
  if (cleanUrl.startsWith('lovable-uploads/')) {
    return `/${cleanUrl}`;
  }
  
  // Si c'est juste un nom de fichier, construire l'URL Supabase storage
  if (!cleanUrl.includes('/')) {
    try {
      console.log(`Construction de l'URL publique pour: ${cleanUrl}`);
      const { data } = supabase
        .storage
        .from('player-images')
        .getPublicUrl(cleanUrl);
      
      console.log(`URL publique générée: ${data.publicUrl}`);  
      return data.publicUrl;
    } catch (error) {
      console.error("Erreur lors de la construction de l'URL:", error);
      return cleanUrl; // Retourner l'URL originale en cas d'erreur
    }
  }
  
  // Pour tout autre format, retourner tel quel
  return cleanUrl;
};

/**
 * Vérifie si le joueur a une image valide
 */
export const hasPlayerImage = (imageUrl: string | null | undefined): boolean => {
  if (!imageUrl) return false;
  
  // Vérifier si c'est une URL valide de Supabase Storage
  if (imageUrl.includes('supabase.co/storage')) {
    return true;
  }
  
  // Vérifier si c'est une URL externe
  if (imageUrl.startsWith('http')) {
    return true;
  }
  
  // Vérifier si c'est un chemin relatif vers le dossier public
  if (imageUrl.startsWith('/lovable-uploads/') || imageUrl.startsWith('lovable-uploads/')) {
    return true;
  }
  
  // Considérer que c'est juste un nom de fichier dans le stockage
  return true;
};

/**
 * Récupère une liste de toutes les images dans le bucket player-images
 */
export const listAllPlayerImages = async (): Promise<string[]> => {
  const allImages: string[] = [];
  let lastOffset = 0;
  let hasMore = true;
  
  console.log("Récupération de toutes les images du bucket player-images...");
  
  try {
    while (hasMore) {
      const { data, error } = await supabase
        .storage
        .from('player-images')
        .list('', {
          limit: 100,
          offset: lastOffset,
          sortBy: { column: 'name', order: 'asc' }
        });
      
      if (error) {
        console.error("Erreur lors de la récupération des images:", error);
        break;
      }
      
      if (!data || data.length === 0) {
        hasMore = false;
        break;
      }
      
      // Récupérer les noms de fichiers
      const fileNames = data.filter(item => !item.id.endsWith('/')).map(item => item.name);
      allImages.push(...fileNames);
      
      lastOffset += data.length;
      
      // Si on a récupéré moins que la limite, on a tout récupéré
      if (data.length < 100) {
        hasMore = false;
      }
    }
    
    console.log(`Total d'images récupérées: ${allImages.length}`);
    return allImages;
  } catch (error) {
    console.error("Erreur lors de la récupération des images:", error);
    return [];
  }
};
