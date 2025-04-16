
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import PlayerImagesSection from "./PlayerImagesSection";
import PageHeader from "./PageHeader";
import HelpDialog from "./HelpDialog";
import BucketStatusSection from "./BucketStatusSection";
import DatabaseConnectionStatus from "./DatabaseConnectionStatus";
import { checkBucketRlsPermission } from "@/utils/database/teams/images/rlsPermissions";
import BucketCreator from "../BucketCreator";
import ClearImagesDialog from "./ClearImagesDialog";
import { clearAllPlayerImageReferences } from "@/utils/database/teams/images/clearImages";
import { refreshImageReferences } from "@/utils/database/teams/images/refreshImages";

const PlayerImagesContainer = () => {
  const [bucketStatus, setBucketStatus] = useState<"loading" | "exists" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [helpOpen, setHelpOpen] = useState(false);
  const [helpType, setHelpType] = useState<"bucket" | "rls">("bucket");
  const [isRefreshingImages, setIsRefreshingImages] = useState(false);
  const [refreshProgress, setRefreshProgress] = useState(0);
  const [refreshComplete, setRefreshComplete] = useState(false);
  const [isProcessingClearAll, setIsProcessingClearAll] = useState(false);
  const [showConfirmClearAll, setShowConfirmClearAll] = useState(false);
  const [totalImagesInBucket, setTotalImagesInBucket] = useState<number | null>(null);
  const [totalPlayersWithImages, setTotalPlayersWithImages] = useState<number | null>(null);
  
  const [rlsStatus, setRlsStatus] = useState({
    checked: false,
    canUpload: false,
    canList: false,
    canCreate: false,
    message: null as string | null
  });

  // Check if the storage bucket exists and get image stats
  const checkBucketAccess = async () => {
    try {
      setBucketStatus("loading");
      
      // First try to list files directly in the bucket
      const { data: files, error: listError } = await supabase.storage
        .from('player-images')
        .list('');
        
      if (!listError) {
        console.log("Successfully listed files in player-images bucket:", files?.length || 0);
        setBucketStatus("exists");
        toast.success("Bucket d'images accessible");
        
        // Update total images count
        setTotalImagesInBucket(files?.length || 0);
        
        // If we can list files, we have access to the bucket
        setRlsStatus(prev => ({
          ...prev,
          checked: true,
          canList: true
        }));
        
        // Also get count of players with images in DB
        const { count: playersWithImagesCount, error: countError } = await supabase
          .from('players')
          .select('playerid', { count: 'exact', head: true })
          .not('image', 'is', null);
          
        if (!countError && playersWithImagesCount !== null) {
          setTotalPlayersWithImages(playersWithImagesCount);
          console.log(`Found ${playersWithImagesCount} players with image references in database`);
        }
        
        // Check upload permissions separately
        try {
          const rlsCheckResult = await checkBucketRlsPermission();
          setRlsStatus({
            checked: true,
            canUpload: rlsCheckResult.canUpload,
            canList: true, // We already know we can list
            canCreate: rlsCheckResult.canCreate,
            message: rlsCheckResult.errorMessage
          });
        } catch (rlsError) {
          console.error("Error checking RLS for uploads:", rlsError);
          setRlsStatus(prev => ({
            ...prev,
            checked: true,
            canUpload: false,
            message: rlsError instanceof Error ? rlsError.message : String(rlsError)
          }));
        }
        return;
      }
      
      console.error("Error listing files in bucket, fallback to checking buckets:", listError);
      
      // If listing files failed, try listing buckets as fallback
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      
      if (bucketError) {
        console.error("Error getting buckets:", bucketError);
        setErrorMessage(`Erreur lors de la récupération des buckets: ${bucketError.message}`);
        setBucketStatus("error");
        return;
      }
      
      console.log("Available buckets:", buckets?.map(b => `"${b.name}"`).join(", "));
      
      const bucketExists = buckets?.some(bucket => bucket.name === 'player-images');
      
      if (!bucketExists) {
        console.error("Bucket 'player-images' not in list, but checking direct access");
        
        // Double-check by trying to list files
        const { error: doubleCheckError } = await supabase.storage
          .from('player-images')
          .list('', { limit: 1 });
          
        if (doubleCheckError) {
          console.error("Confirmed bucket doesn't exist or not accessible:", doubleCheckError);
          setErrorMessage("Le bucket 'player-images' n'existe pas dans votre projet Supabase ou n'est pas accessible.");
          setBucketStatus("error");
        } else {
          console.log("Bucket exists but not listed (RLS issue)");
          setBucketStatus("exists");
          toast.success("Bucket d'images accessible");
        }
      } else {
        console.log("Bucket 'player-images' exists in list");
        setBucketStatus("exists");
        toast.success("Bucket d'images accessible");
      }
      
      // Check RLS permissions separately
      try {
        const rlsCheckResult = await checkBucketRlsPermission();
        setRlsStatus({
          checked: true,
          canUpload: rlsCheckResult.canUpload,
          canList: rlsCheckResult.canList,
          canCreate: rlsCheckResult.canCreate,
          message: rlsCheckResult.errorMessage
        });
      } catch (rlsError) {
        console.error("Error checking RLS:", rlsError);
        setRlsStatus({
          checked: true,
          canUpload: false,
          canList: false,
          canCreate: false,
          message: rlsError instanceof Error ? rlsError.message : String(rlsError)
        });
      }
    } catch (error) {
      console.error("Error checking bucket:", error);
      setErrorMessage(error instanceof Error ? error.message : String(error));
      setBucketStatus("error");
    }
  };

  // Check bucket access on component mount
  useEffect(() => {
    checkBucketAccess();
  }, []);

  const handleRefreshImages = async () => {
    try {
      setIsRefreshingImages(true);
      setRefreshProgress(0);
      
      // Call the image refresh function
      const result = await refreshImageReferences();
      
      setRefreshProgress(100);
      setRefreshComplete(true);
      
      // Update the counts after refresh
      await checkBucketAccess();
      
      if (result.fixedCount > 0) {
        toast.success(`${result.fixedCount} références d'images invalides ont été supprimées`);
      } else {
        toast.info("Aucune référence d'image invalide trouvée");
      }
    } catch (error) {
      console.error("Erreur lors du rafraîchissement des images:", error);
      toast.error("Une erreur s'est produite lors de la vérification des images");
    } finally {
      setIsRefreshingImages(false);
    }
  };

  const handleClearAllImages = async () => {
    try {
      setIsProcessingClearAll(true);
      console.log("Clearing all player image references...");
      
      const result = await clearAllPlayerImageReferences(true);
      
      if (result.success) {
        console.log(`Suppression réussie: ${result.clearedCount} références`);
        toast.success(`${result.clearedCount} références d'images ont été supprimées`);
        
        // Update the counts after deletion
        await checkBucketAccess();
      } else {
        console.error("Échec de la suppression des références d'images");
        toast.error("Échec de la suppression des références d'images");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de toutes les images:", error);
      toast.error("Une erreur s'est produite lors de la suppression des images");
    } finally {
      setIsProcessingClearAll(false);
      setShowConfirmClearAll(false);
    }
  };

  const showRlsHelp = () => {
    setHelpType("rls");
    setHelpOpen(true);
  };

  const showBucketHelp = () => {
    setHelpType("bucket");
    setHelpOpen(true);
  };

  const handleBucketCreated = () => {
    toast.success("Bucket créé avec succès!");
    checkBucketAccess();
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <PageHeader onCheckBucket={checkBucketAccess} />
      
      <div className="grid gap-6 mt-6">
        {bucketStatus === "error" && (
          <BucketCreator 
            bucketId="player-images" 
            onBucketCreated={handleBucketCreated} 
          />
        )}

        <BucketStatusSection
          bucketStatus={bucketStatus}
          errorMessage={errorMessage}
          rlsStatus={rlsStatus}
          isRefreshingImages={isRefreshingImages}
          refreshProgress={refreshProgress}
          refreshComplete={refreshComplete}
          isProcessingClearAll={isProcessingClearAll}
          totalImagesInBucket={totalImagesInBucket}
          totalPlayersWithImages={totalPlayersWithImages}
          handleRefreshImages={handleRefreshImages}
          setShowConfirmClearAll={setShowConfirmClearAll}
          setShowHelp={showBucketHelp}
          setShowRlsHelp={showRlsHelp}
        />
        
        <PlayerImagesSection 
          bucketStatus={bucketStatus}
          rlsEnabled={!rlsStatus.canUpload || !rlsStatus.canList}
          showRlsHelp={showRlsHelp}
        />
      </div>
      
      <HelpDialog 
        open={helpOpen} 
        onOpenChange={setHelpOpen} 
        type={helpType}
        rlsErrorMessage={rlsStatus.message}
      />

      <ClearImagesDialog 
        open={showConfirmClearAll}
        onOpenChange={setShowConfirmClearAll}
        isProcessing={isProcessingClearAll}
        onConfirm={handleClearAllImages}
      />
    </div>
  );
};

export default PlayerImagesContainer;
