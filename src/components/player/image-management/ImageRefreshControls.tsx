
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Trash2, RotateCcw } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ImageRefreshControlsProps {
  isRefreshingImages: boolean;
  refreshProgress: number;
  refreshComplete: boolean;
  isProcessingClearAll: boolean;
  isSyncingReferences: boolean;
  handleRefreshImages: () => Promise<void>;
  handleSynchronizeReferences: () => Promise<void>;
  setShowConfirmClearAll: (show: boolean) => void;
}

const ImageRefreshControls = ({ 
  isRefreshingImages, 
  refreshProgress, 
  refreshComplete, 
  isProcessingClearAll,
  isSyncingReferences,
  handleRefreshImages,
  handleSynchronizeReferences,
  setShowConfirmClearAll
}: ImageRefreshControlsProps) => {
  return (
    <div className="space-y-3 mb-4">
      <div className="flex flex-wrap gap-2 items-center">
        <Button
          onClick={handleRefreshImages}
          disabled={isRefreshingImages || isSyncingReferences}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshingImages ? 'animate-spin' : ''}`} />
          {isRefreshingImages 
            ? 'Vérification en cours...' 
            : refreshComplete 
              ? 'Vérification terminée' 
              : 'Vérifier les références'}
        </Button>

        <Button
          onClick={handleSynchronizeReferences}
          disabled={isSyncingReferences || isRefreshingImages}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RotateCcw className={`h-4 w-4 ${isSyncingReferences ? 'animate-spin' : ''}`} />
          {isSyncingReferences 
            ? 'Synchronisation en cours...' 
            : 'Synchroniser les références'}
        </Button>

        <Button
          variant="destructive"
          size="sm"
          className="flex items-center gap-2"
          disabled={isProcessingClearAll || isRefreshingImages || isSyncingReferences}
          onClick={() => setShowConfirmClearAll(true)}
        >
          <Trash2 className="h-4 w-4" />
          Supprimer toutes les références d'images
        </Button>
      </div>

      {isRefreshingImages && (
        <Progress value={refreshProgress} className="h-2" />
      )}

      {refreshProgress > 0 && !refreshComplete && !isRefreshingImages && (
        <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-md p-2">
          Traitement partiel effectué ({refreshProgress}%). Cliquez à nouveau sur le bouton pour continuer.
        </div>
      )}
    </div>
  );
};

export default ImageRefreshControls;
