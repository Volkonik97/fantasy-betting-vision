
import { supabase } from "@/integrations/supabase/client";

interface RlsPermissionsResult {
  canUpload: boolean;
  canList: boolean;
  errorMessage: string | null;
}

/**
 * Check if the current user has proper RLS permissions for the player-images bucket
 * @returns Object with permission status
 */
export const checkBucketRlsPermission = async (): Promise<RlsPermissionsResult> => {
  const result: RlsPermissionsResult = {
    canUpload: false,
    canList: false,
    errorMessage: null
  };
  
  try {
    // Check listing permissions first
    console.log("Vérification des permissions de listage RLS");
    const { data: listData, error: listError } = await supabase
      .storage
      .from('player-images')
      .list('', { limit: 1 });
    
    if (listError) {
      console.error("Erreur lors de la vérification des permissions de listage:", listError);
      result.errorMessage = `Erreur de listage: ${listError.message}`;
    } else {
      console.log("Permissions de listage vérifiées:", listData);
      result.canList = true;
    }
    
    // Next, check upload permissions using a tiny test file that we'll remove right away
    console.log("Vérification des permissions d'upload RLS");
    const testBlob = new Blob(['test'], { type: 'text/plain' });
    const testFile = new File([testBlob], 'test-permissions.txt');
    
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('player-images')
      .upload(`test-rls-${Date.now()}.txt`, testFile, {
        cacheControl: '0',
        upsert: true
      });
    
    if (uploadError) {
      console.error("Erreur lors de la vérification des permissions d'upload:", uploadError);
      
      if (!result.errorMessage) {
        result.errorMessage = `Erreur d'upload: ${uploadError.message}`;
      } else {
        result.errorMessage += ` | Erreur d'upload: ${uploadError.message}`;
      }
    } else {
      console.log("Permissions d'upload vérifiées:", uploadData);
      result.canUpload = true;
      
      // Clean up the test file
      if (uploadData?.path) {
        const { error: deleteError } = await supabase
          .storage
          .from('player-images')
          .remove([uploadData.path]);
        
        if (deleteError) {
          console.warn("Impossible de supprimer le fichier de test:", deleteError);
        } else {
          console.log("Fichier de test supprimé avec succès");
        }
      }
    }
    
    return result;
  } catch (error) {
    console.error("Erreur lors de la vérification des permissions RLS:", error);
    result.errorMessage = `Exception: ${error instanceof Error ? error.message : String(error)}`;
    return result;
  }
};
