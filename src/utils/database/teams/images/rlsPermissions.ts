
import { supabase } from "@/integrations/supabase/client";

/**
 * Check if RLS is properly configured for player-images bucket
 * @returns Object with RLS status information
 */
export const checkBucketRlsPermission = async (): Promise<{ 
  canUpload: boolean; 
  canList: boolean; 
  errorMessage: string | null;
}> => {
  try {
    // First try listing files to check read access
    const { data: listData, error: listError } = await supabase
      .storage
      .from('player-images')
      .list('', { limit: 1 });

    // Try test upload to check write access (we'll delete it right after)
    const testBlob = new Blob(['test'], { type: 'text/plain' });
    const testFile = new File([testBlob], '_rls_test_file.txt');
    
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('player-images')
      .upload(`_rls_test/${Date.now()}.txt`, testFile, {
        cacheControl: '0',
        upsert: true
      });
      
    // If uploaded successfully, try to remove it
    if (uploadData?.path) {
      await supabase.storage
        .from('player-images')
        .remove([uploadData.path]);
    }

    return {
      canList: !listError,
      canUpload: !uploadError,
      errorMessage: uploadError ? 
        `RLS policy error: ${uploadError.message}` : 
        (listError ? `RLS list error: ${listError.message}` : null)
    };
  } catch (error) {
    console.error("Exception checking RLS permissions:", error);
    return {
      canList: false,
      canUpload: false,
      errorMessage: `Exception: ${error instanceof Error ? error.message : String(error)}`
    };
  }
};
