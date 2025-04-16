
import { supabase } from "@/integrations/supabase/client";

/**
 * Check if bucket exists and whether RLS is enabled
 * @returns Object with access status and RLS configuration
 */
export const checkBucketRlsPermission = async (): Promise<{
  canAccess: boolean;
  enabled: boolean;
}> => {
  try {
    // Try to list files in the bucket
    const { data, error } = await supabase
      .storage
      .from('player-images')
      .list('', { limit: 1 });
    
    if (error) {
      // Check if the error is related to permissions (RLS)
      const isRlsError = error.message.includes('permission') || 
                         error.message.includes('not authorized') || 
                         error.message.includes('403');
      
      console.log("Erreur d'accès au bucket:", error.message, "RLS activé:", isRlsError);
      
      return {
        canAccess: false,
        enabled: isRlsError
      };
    }
    
    // If we can list files, check if we can also upload/download to determine RLS status
    try {
      // Try to get a public URL as a test (this should work regardless of RLS)
      const { data: publicUrlData } = supabase
        .storage
        .from('player-images')
        .getPublicUrl('test-rls-check.txt');
      
      // Try to upload a small file
      const testBlob = new Blob(['RLS test'], { type: 'text/plain' });
      const testFile = new File([testBlob], 'test-rls-check.txt');
      
      const { error: uploadError } = await supabase
        .storage
        .from('player-images')
        .upload('test-rls-check.txt', testFile, { upsert: true });
      
      // RLS might be enabled but allowing the current user to upload
      const hasUploadRights = !uploadError;
      
      // Clean up test file if uploaded successfully
      if (hasUploadRights) {
        await supabase
          .storage
          .from('player-images')
          .remove(['test-rls-check.txt']);
      }
      
      console.log("Test d'accès au bucket: upload possible:", hasUploadRights);
      
      return {
        canAccess: true,
        enabled: !hasUploadRights // If we can't upload, RLS is likely restricting it
      };
    } catch (testError) {
      console.log("Test d'accès au bucket échoué:", testError);
      
      // We could still list files, so bucket exists but there might be restrictions
      return {
        canAccess: true,
        enabled: true // Assume RLS is enabled if our test fails
      };
    }
  } catch (error) {
    console.error("Erreur lors de la vérification des permissions:", error);
    
    return {
      canAccess: false,
      enabled: false
    };
  }
};
