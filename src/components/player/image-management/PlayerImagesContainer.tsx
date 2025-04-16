
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import PlayerImagesSection from "./PlayerImagesSection";
import PageHeader from "./PageHeader";
import HelpDialog from "./HelpDialog";
import BucketStatusSection from "./BucketStatusSection";
import DatabaseConnectionStatus from "./DatabaseConnectionStatus";
import { checkBucketRlsPermission } from "@/utils/database/teams/images/rlsPermissions";
import { toast } from "sonner";
import BucketCreator from "../BucketCreator";

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
  
  const [rlsStatus, setRlsStatus] = useState({
    checked: false,
    canUpload: false,
    canList: false,
    message: null as string | null
  });

  // Check if the storage bucket exists
  const checkBucketAccess = async () => {
    try {
      setBucketStatus("loading");
      
      // First check if bucket exists
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      
      if (bucketError) {
        console.error("Error getting buckets:", bucketError);
        setErrorMessage(`Erreur lors de la récupération des buckets: ${bucketError.message}`);
        setBucketStatus("error");
        return;
      }
      
      console.log("Available buckets:", buckets?.map(b => `"${b.name}"`).join(", "));
      
      const bucketExists = buckets?.some(bucket => bucket.name === 'Player Images');
      
      if (!bucketExists) {
        console.error("Bucket 'Player Images' does not exist");
        setErrorMessage("Le bucket 'Player Images' n'existe pas dans votre projet Supabase.");
        setBucketStatus("error");
        return;
      }
      
      // Now try to list files to verify access
      const { data: files, error: listError } = await supabase.storage
        .from('Player Images')
        .list('');
        
      if (listError) {
        console.error("Error listing files:", listError);
        setErrorMessage(`Erreur lors de la liste des fichiers: ${listError.message}`);
        setBucketStatus("error");
      } else {
        console.log("Successfully listed files:", files);
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
          message: rlsCheckResult.errorMessage
        });
      } catch (rlsError) {
        console.error("Error checking RLS:", rlsError);
        setRlsStatus({
          checked: true,
          canUpload: false,
          canList: false,
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
    // This would be implemented to refresh player images
    console.log("Refreshing images...");
    // Mock implementation
    setIsRefreshingImages(true);
    setRefreshProgress(0);
    
    // Simulate progress
    const interval = setInterval(() => {
      setRefreshProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRefreshingImages(false);
          setRefreshComplete(true);
          return 100;
        }
        return prev + 10;
      });
    }, 500);
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
            bucketId="Player Images" 
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
    </div>
  );
};

export default PlayerImagesContainer;
