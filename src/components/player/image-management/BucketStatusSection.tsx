
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
  isSyncingReferences: boolean;
  totalImagesInBucket: number | null;
  totalPlayersWithImages: number | null;
  handleRefreshImages: () => Promise<void>;
  handleSynchronizeReferences: () => Promise<void>;
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
  isSyncingReferences,
  totalImagesInBucket,
  totalPlayersWithImages,
  handleRefreshImages,
  handleSynchronizeReferences,
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
          
          {totalImagesInBucket !== null && (
            <div className="mb-3 text-sm">
              <p>
                <span className="font-semibold">Fichiers dans le stockage:</span> {totalImagesInBucket} images
                {totalPlayersWithImages !== null && (
                  <span className="ml-4">
                    <span className="font-semibold">Joueurs avec références d'images:</span> {totalPlayersWithImages}
                  </span>
                )}
                {totalImagesInBucket > 0 && totalPlayersWithImages === 0 && (
                  <span className="ml-2 text-amber-600">
                    (Désynchronisation détectée: des fichiers existent sans références dans la base de données)
                  </span>
                )}
                {totalImagesInBucket === 0 && totalPlayersWithImages && totalPlayersWithImages > 0 && (
                  <span className="ml-2 text-amber-600">
                    (Désynchronisation détectée: des références existent sans fichiers dans le stockage)
                  </span>
                )}
              </p>
            </div>
          )}
          
          <ImageRefreshControls
            isRefreshingImages={isRefreshingImages}
            refreshProgress={refreshProgress}
            refreshComplete={refreshComplete}
            isProcessingClearAll={isProcessingClearAll}
            isSyncingReferences={isSyncingReferences}
            handleRefreshImages={handleRefreshImages}
            handleSynchronizeReferences={handleSynchronizeReferences}
            setShowConfirmClearAll={setShowConfirmClearAll}
          />
          
          <p className="mb-4 text-xs text-gray-500">
            <span className="block mb-1">
              <strong>Vérification:</strong> Détecte les références d'images invalides et les supprime.
            </span>
            <span className="block mb-1">
              <strong>Synchronisation:</strong> Associe automatiquement les fichiers aux joueurs correspondants et nettoie les références invalides.
            </span>
            <span className="block">
              <strong>Suppression:</strong> Le bouton rouge supprimera toutes les références d'images dans la base de données et les fichiers dans le stockage.
            </span>
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
