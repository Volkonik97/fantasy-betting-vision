
import { supabase } from "@/integrations/supabase/client";

interface RlsPermissionsResult {
  canUpload: boolean;
  canList: boolean;
  errorMessage: string | null;
}

/**
 * Check if the current user has proper RLS permissions for the Player Images bucket
 * @returns Object with permission status
 */
export const checkBucketRlsPermission = async (): Promise<RlsPermissionsResult> => {
  const result: RlsPermissionsResult = {
    canUpload: false,
    canList: false,
    errorMessage: null
  };
  
  // Check if the bucket exists first
  const bucketName = 'Player Images'; // Using the correct bucket name with space
  
  try {
    console.log(`Checking RLS permissions for bucket: "${bucketName}"`);
    
    const { data: buckets, error: bucketError } = await supabase
      .storage
      .listBuckets();
    
    if (bucketError) {
      console.error("Error checking for buckets:", bucketError);
      result.errorMessage = `Error checking buckets: ${bucketError.message}`;
      return result;
    }
    
    console.log("Available buckets:", buckets?.map(b => `"${b.name}"`).join(", "));
    
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    if (!bucketExists) {
      console.error(`Bucket "${bucketName}" does not exist`);
      result.errorMessage = `Le bucket '${bucketName}' n'existe pas. Veuillez créer le bucket dans la console Supabase ou utiliser le bouton de création.`;
      return result;
    }
    
    // Check listing permissions first
    console.log(`Checking RLS listing permissions for "${bucketName}"`);
    const { data: listData, error: listError } = await supabase
      .storage
      .from(bucketName)
      .list('', { limit: 1 });
    
    if (listError) {
      console.error("Error checking listing permissions:", listError);
      result.errorMessage = `Listing error: ${listError.message}`;
    } else {
      console.log("Listing permissions verified:", listData);
      result.canList = true;
    }
    
    // Next, check upload permissions using a tiny test file that we'll remove right away
    console.log(`Checking RLS upload permissions for "${bucketName}"`);
    const testBlob = new Blob(['test'], { type: 'text/plain' });
    const testFile = new File([testBlob], 'test-permissions.txt');
    
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from(bucketName)
      .upload(`test-rls-${Date.now()}.txt`, testFile, {
        cacheControl: '0',
        upsert: true
      });
    
    if (uploadError) {
      console.error("Error checking upload permissions:", uploadError);
      
      if (!result.errorMessage) {
        result.errorMessage = `Upload error: ${uploadError.message}`;
      } else {
        result.errorMessage += ` | Upload error: ${uploadError.message}`;
      }
    } else {
      console.log("Upload permissions verified:", uploadData);
      result.canUpload = true;
      
      // Clean up the test file
      if (uploadData?.path) {
        try {
          const { error: deleteError } = await supabase
            .storage
            .from(bucketName)
            .remove([uploadData.path]);
          
          if (deleteError) {
            console.warn("Failed to remove test file:", deleteError);
          } else {
            console.log("Test file successfully removed");
          }
        } catch (deleteError) {
          console.warn("Exception removing test file:", deleteError);
        }
      }
    }
    
    return result;
  } catch (error) {
    console.error("Exception during RLS permissions check:", error);
    result.errorMessage = `Exception: ${error instanceof Error ? error.message : String(error)}`;
    return result;
  }
};
