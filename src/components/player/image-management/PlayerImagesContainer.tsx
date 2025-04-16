
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import PlayerImagesSection from "./PlayerImagesSection";
import PageHeader from "./PageHeader";
import HelpDialog from "./HelpDialog";
import BucketStatusSection from "./BucketStatusSection";
import DatabaseConnectionStatus from "./DatabaseConnectionStatus";
import { checkBucketRlsPermission } from "@/utils/database/teams/images/rlsPermissions";

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
      
      const { data, error } = await supabase.storage.getBucket('player-images');
      
      if (error) {
        setErrorMessage(error.message);
        setBucketStatus("error");
        return;
      }
      
      if (data) {
        // Test if we can actually access the bucket by listing files
        const { data: files, error: listError } = await supabase.storage
          .from('player-images')
          .list('');
          
        if (listError) {
          setErrorMessage(listError.message);
          setBucketStatus("error");
          
          // Check for RLS permissions if there was an error
          const rlsCheckResult = await checkBucketRlsPermission();
          setRlsStatus({
            checked: true,
            canUpload: rlsCheckResult.canUpload,
            canList: rlsCheckResult.canList,
            message: rlsCheckResult.errorMessage
          });
        } else {
          setBucketStatus("exists");
          
          // Also check RLS permissions even if we can list
          const rlsCheckResult = await checkBucketRlsPermission();
          setRlsStatus({
            checked: true,
            canUpload: rlsCheckResult.canUpload,
            canList: rlsCheckResult.canList,
            message: rlsCheckResult.errorMessage
          });
        }
      } else {
        setErrorMessage("Bucket does not exist");
        setBucketStatus("error");
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

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <PageHeader onCheckBucket={checkBucketAccess} />
      
      <div className="grid gap-6 mt-6">
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
