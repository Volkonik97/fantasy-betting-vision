
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
    if (imageUrl.includes('supabase.co/storage') && imageUrl.includes('player-images')) {
      // Extraire le chemin du fichier depuis l'URL
      const regex = new RegExp(`player-images\\/([^?]+)`);
      const match = imageUrl.match(regex);
      
      if (match && match[1]) {
        const filePath = decodeURIComponent(match[1]);
        
        const { data, error } = await supabase
          .storage
          .from('player-images')
          .download(filePath);
        
        return !error;
      }
      return false;
    }
    
    // Pour les noms de fichiers simples
    if (!imageUrl.includes('/') && !imageUrl.startsWith('http')) {
      const { data, error } = await supabase
        .storage
        .from('player-images')
        .download(imageUrl);
      
      return !error;
    }
    
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
  if (cleanUrl.includes('supabase.co/storage') && cleanUrl.includes('player-images')) {
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
      const { data } = supabase
        .storage
        .from('player-images')
        .getPublicUrl(cleanUrl);
        
      return data.publicUrl;
    } catch (error) {
      console.error("Erreur lors de la construction de l'URL:", error);
      return cleanUrl; // Retourner l'URL originale en cas d'erreur
    }
  }
  
  // Pour tout autre format, retourner tel quel
  return cleanUrl;
};
