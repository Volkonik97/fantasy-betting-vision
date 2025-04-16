
import { supabase } from "@/integrations/supabase/client";

interface RlsPermissionsResult {
  canUpload: boolean;
  canList: boolean;
  canCreate: boolean;
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
    canCreate: false,
    errorMessage: null
  };
  
  // Check if the bucket exists first
  const bucketName = 'player-images';
  
  try {
    console.log(`Checking RLS permissions for bucket: "${bucketName}"`);
    
    // First check if user has permission to list buckets (admin action)
    const { data: buckets, error: bucketError } = await supabase
      .storage
      .listBuckets();
    
    if (bucketError) {
      console.error("Error checking for buckets:", bucketError);
      
      if (bucketError.message?.includes("policy") || bucketError.message?.includes("RLS")) {
        result.errorMessage = "Erreur de politique RLS: Vous n'avez pas les permissions nécessaires pour lister les buckets.";
      } else {
        result.errorMessage = `Error checking buckets: ${bucketError.message}`;
      }
      return result;
    }
    
    console.log("Available buckets:", buckets?.map(b => `"${b.name}"`).join(", "));
    
    // User can list buckets, which suggests they might have create permission
    result.canCreate = true;
    
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    if (!bucketExists) {
      console.error(`Bucket "${bucketName}" does not exist in list of buckets, but it might be an RLS issue`);
      
      // Try listing files to double-check if the bucket exists but just isn't visible in the list
      const { data: filesTest, error: filesTestError } = await supabase
        .storage
        .from(bucketName)
        .list('');
      
      if (!filesTestError) {
        console.log(`Bucket "${bucketName}" exists but wasn't listed (likely due to RLS)`);
        // Continue checking permissions since we can access the bucket
      } else {
        console.error(`Confirmed bucket "${bucketName}" does not exist or is not accessible:`, filesTestError);
        
        // Try to create the bucket to check if user has permission
        const { error: createError } = await supabase.storage.createBucket(bucketName, {
          public: true,
          fileSizeLimit: 5242880, // 5MB
        });
        
        if (createError) {
          console.error("Error creating bucket:", createError);
          result.canCreate = false;
          
          if (createError.message?.includes("policy") || createError.message?.includes("RLS")) {
            result.errorMessage = "Erreur de politique RLS: Vous n'avez pas la permission de créer des buckets. Cette opération doit être effectuée par l'administrateur du projet.";
          } else {
            result.errorMessage = `Erreur lors de la création du bucket: ${createError.message}`;
          }
          return result;
        }
        
        // If we get here, bucket was created successfully
        console.log(`Successfully created bucket "${bucketName}"`);
      }
      result.canCreate = true;
    }
    
    // Check listing permissions first
    console.log(`Checking RLS listing permissions for "${bucketName}"`);
    const { data: listData, error: listError } = await supabase
      .storage
      .from(bucketName)
      .list('', { limit: 1 });
    
    if (listError) {
      console.error("Error checking listing permissions:", listError);
      
      if (listError.message?.includes("policy") || listError.message?.includes("RLS")) {
        result.errorMessage = "Erreur RLS: Vous n'avez pas la permission de lister les fichiers dans ce bucket.";
      } else {
        result.errorMessage = `Listing error: ${listError.message}`;
      }
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
      
      if (uploadError.message?.includes("policy") || uploadError.message?.includes("RLS")) {
        const errorMsg = "Erreur de politique RLS: Vous n'avez pas la permission d'uploader des fichiers dans ce bucket.";
        result.errorMessage = !result.errorMessage ? errorMsg : `${result.errorMessage} | ${errorMsg}`;
      } else {
        const errorMsg = `Upload error: ${uploadError.message}`;
        result.errorMessage = !result.errorMessage ? errorMsg : `${result.errorMessage} | ${errorMsg}`;
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

