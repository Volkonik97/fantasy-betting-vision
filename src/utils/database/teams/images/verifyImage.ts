
import { supabase } from "@/integrations/supabase/client";

/**
 * Check if an image URL is accessible in the Supabase storage
 * @param imageUrl The full URL of the image to check
 * @returns Boolean indicating if the image is accessible
 */
export const verifyImageExists = async (imageUrl: string): Promise<boolean> => {
  if (!imageUrl) return false;
  
  try {
    // Pour les URLs externes (pas Supabase storage), retourner true
    if (!imageUrl.includes('supabase.co/storage')) {
      return true;
    }
    
    // Extraire le nom du bucket et le chemin à partir de l'URL
    // Format d'URL exemple: https://{project-ref}.supabase.co/storage/v1/object/public/{bucket}/{path}
    const urlParts = imageUrl.split('/storage/v1/object/public/');
    if (urlParts.length !== 2) {
      console.warn(`Format d'URL d'image invalide: ${imageUrl}`);
      return false;
    }
    
    const pathParts = urlParts[1].split('/');
    if (pathParts.length < 2) {
      console.warn(`Pas assez de parties dans le chemin URL: ${imageUrl}`);
      return false;
    }
    
    const bucket = pathParts[0];
    const path = pathParts.slice(1).join('/');
    
    if (!bucket || !path) {
      console.warn(`Bucket ou chemin manquant dans l'URL: ${imageUrl}`);
      return false;
    }
    
    console.log(`Vérification de l'image dans le bucket: ${bucket}, chemin: ${path}`);
    
    // Vérifier si l'objet existe sans le télécharger
    const { data, error } = await supabase
      .storage
      .from(bucket)
      .createSignedUrl(path, 60); // Créer une URL signée avec 60 secondes d'expiration
    
    if (error) {
      console.error("Erreur lors de la vérification de l'existence de l'image:", error);
      return false;
    }
    
    // Si nous avons réussi à créer une URL signée, le fichier existe
    return !!data;
  } catch (error) {
    console.error("Exception lors de la vérification de l'image:", error);
    return false;
  }
};
