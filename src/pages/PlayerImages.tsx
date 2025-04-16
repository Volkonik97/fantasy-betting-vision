
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  refreshImageReferences, 
  clearAllPlayerImageReferences, 
  checkBucketRlsPermission 
} from "@/utils/database/teams/imageUtils";

// Import all the components
import PageHeader from "@/components/player/image-management/PageHeader";
import BucketAccessAlert from "@/components/player/image-management/BucketAccessAlert";
import ImageRefreshControls from "@/components/player/image-management/ImageRefreshControls";
import ClearImagesDialog from "@/components/player/image-management/ClearImagesDialog";
import HelpDialog from "@/components/player/image-management/HelpDialog";
import LoadingIndicator from "@/components/player/image-management/LoadingIndicator";
import PlayerImagesSection from "@/components/player/image-management/PlayerImagesSection";

const PlayerImages = () => {
  const [bucketStatus, setBucketStatus] = useState<"loading" | "exists" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [rlsStatus, setRlsStatus] = useState<{ 
    checked: boolean, 
    canUpload: boolean, 
    canList: boolean, 
    message: string | null 
  }>({
    checked: false,
    canUpload: false,
    canList: false,
    message: null
  });
  const [isRefreshingImages, setIsRefreshingImages] = useState(false);
  const [isProcessingClearAll, setIsProcessingClearAll] = useState(false);
  const [refreshProgress, setRefreshProgress] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [showConfirmClearAll, setShowConfirmClearAll] = useState(false);
  const [refreshComplete, setRefreshComplete] = useState(false);
  const [showRlsHelp, setShowRlsHelp] = useState(false);
  
  const checkBucket = async () => {
    setBucketStatus("loading");
    setErrorMessage("");
    
    try {
      const { data: listData, error: listError } = await supabase.storage
        .from('player-images')
        .list('', { limit: 1 });
      
      if (listError) {
        console.error("Error listing files in player-images bucket:", listError);
        
        const { data: bucketData, error: bucketError } = await supabase.storage.getBucket('player-images');
        
        if (bucketError) {
          console.error("Error accessing player-images bucket:", bucketError);
          setBucketStatus("error");
          setErrorMessage(bucketError.message);
        } else {
          console.log("Bucket player-images exists but might have restricted permissions:", bucketData);
          setBucketStatus("exists");
          toast.info("Le bucket existe mais pourrait avoir des restrictions d'accès");
          
          checkRlsPermissions();
        }
      } else {
        console.log("Bucket player-images accessible, files found:", listData);
        setBucketStatus("exists");
        toast.success("Connexion au bucket réussie");
        
        checkRlsPermissions();
      }
    } catch (error) {
      console.error("Exception checking bucket:", error);
      setBucketStatus("error");
      setErrorMessage(error instanceof Error ? error.message : String(error));
    }
  };

  const checkRlsPermissions = async () => {
    const result = await checkBucketRlsPermission();
    setRlsStatus({
      checked: true,
      canUpload: result.canUpload,
      canList: result.canList,
      message: result.errorMessage
    });
    
    if (!result.canUpload) {
      toast.error("Problème de permissions RLS: Impossible de télécharger des images");
    }
  };
  
  const handleRefreshImages = async () => {
    if (bucketStatus !== "exists") {
      toast.error("Le bucket de stockage doit être accessible pour rafraîchir les images");
      return;
    }
    
    setIsRefreshingImages(true);
    setRefreshComplete(false);
    setRefreshProgress(0);
    
    try {
      const { fixedCount, completed } = await refreshImageReferences();
      
      if (completed) {
        setRefreshComplete(true);
        if (fixedCount > 0) {
          toast.success(`${fixedCount} références d'images incorrectes ont été supprimées`);
        } else {
          toast.info("Aucune référence d'image incorrecte n'a été trouvée");
        }
      } else {
        setRefreshProgress(50);
        toast.info(`Traitement en cours: ${fixedCount} références corrigées jusqu'à présent`);
        
        toast.info("Pour traiter plus de références, cliquez à nouveau sur le bouton de rafraîchissement");
      }
    } catch (error) {
      console.error("Error refreshing image references:", error);
      toast.error("Erreur lors du rafraîchissement des références d'images");
    } finally {
      setIsRefreshingImages(false);
    }
  };

  const handleClearAllImageReferences = async () => {
    setIsProcessingClearAll(true);
    
    try {
      const { success, clearedCount } = await clearAllPlayerImageReferences(true);
      
      if (success) {
        toast.success(`${clearedCount} références d'images ont été supprimées avec succès et les fichiers associés ont été supprimés du stockage`);
        setShowConfirmClearAll(false);
      } else {
        toast.error("Erreur lors de la suppression des références d'images");
      }
    } catch (error) {
      console.error("Error clearing all image references:", error);
      toast.error("Une erreur s'est produite lors de la suppression des références d'images");
    } finally {
      setIsProcessingClearAll(false);
    }
  };
  
  useEffect(() => {
    checkBucket();
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 pt-24 pb-12">
        <PageHeader onCheckBucket={checkBucket} />
        
        <div className="mb-6">
          {bucketStatus === "loading" && <LoadingIndicator />}
          
          {bucketStatus === "exists" && (
            <>
              <BucketAccessAlert 
                bucketStatus={bucketStatus}
                errorMessage={errorMessage}
                rlsStatus={rlsStatus}
                onShowHelp={() => setShowRlsHelp(true)}
              />
              
              <ImageRefreshControls
                isRefreshingImages={isRefreshingImages}
                refreshProgress={refreshProgress}
                refreshComplete={refreshComplete}
                isProcessingClearAll={isProcessingClearAll}
                handleRefreshImages={handleRefreshImages}
                setShowConfirmClearAll={setShowConfirmClearAll}
              />
              
              <p className="mb-4 text-xs text-gray-500">
                La vérification permet de détecter les références d'images invalides et les supprimer.
                Le bouton rouge supprimera toutes les références d'images dans la base de données.
                {refreshProgress > 0 && !refreshComplete && (
                  <span className="block mt-1 font-medium">
                    Traitement partiel effectué. Cliquez à nouveau pour continuer.
                  </span>
                )}
              </p>
            </>
          )}
          
          {bucketStatus === "error" && (
            <BucketAccessAlert 
              bucketStatus={bucketStatus}
              errorMessage={errorMessage}
              rlsStatus={rlsStatus}
              onShowHelp={() => setShowHelp(true)}
            />
          )}
        </div>
        
        <PlayerImagesSection 
          bucketStatus={bucketStatus}
          rlsEnabled={rlsStatus.checked && !rlsStatus.canUpload}
          showRlsHelp={() => setShowRlsHelp(true)}
        />
      </main>

      {/* Help Dialog */}
      <HelpDialog 
        open={showHelp} 
        onOpenChange={setShowHelp} 
        type="bucket" 
      />

      {/* RLS Help Dialog */}
      <HelpDialog 
        open={showRlsHelp} 
        onOpenChange={setShowRlsHelp} 
        type="rls"
        rlsErrorMessage={rlsStatus.message}
      />

      {/* Clear Images Confirmation Dialog */}
      <ClearImagesDialog
        open={showConfirmClearAll}
        onOpenChange={setShowConfirmClearAll}
        isProcessing={isProcessingClearAll}
        onConfirm={handleClearAllImageReferences}
      />
    </div>
  );
};

export default PlayerImages;
