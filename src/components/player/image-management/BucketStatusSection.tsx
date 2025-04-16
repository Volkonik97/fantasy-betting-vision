
import React from "react";
import BucketAccessAlert from "@/components/player/image-management/BucketAccessAlert";
import ImageRefreshControls from "@/components/player/image-management/ImageRefreshControls";
import LoadingIndicator from "@/components/player/image-management/LoadingIndicator";

interface BucketStatusSectionProps {
  bucketStatus: "loading" | "exists" | "error";
  errorMessage: string;
  rlsStatus: {
    checked: boolean;
    canUpload: boolean;
    canList: boolean;
    message: string | null;
  };
  isRefreshingImages: boolean;
  refreshProgress: number;
  refreshComplete: boolean;
  isProcessingClearAll: boolean;
  handleRefreshImages: () => Promise<void>;
  setShowConfirmClearAll: (show: boolean) => void;
  setShowHelp: (show: boolean) => void;
  setShowRlsHelp: (show: boolean) => void;
}

const BucketStatusSection: React.FC<BucketStatusSectionProps> = ({
  bucketStatus,
  errorMessage,
  rlsStatus,
  isRefreshingImages,
  refreshProgress,
  refreshComplete,
  isProcessingClearAll,
  handleRefreshImages,
  setShowConfirmClearAll,
  setShowHelp,
  setShowRlsHelp
}) => {
  return (
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
  );
};

export default BucketStatusSection;
