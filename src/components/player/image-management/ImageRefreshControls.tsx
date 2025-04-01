
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Trash2 } from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

interface ImageRefreshControlsProps {
  isRefreshingImages: boolean;
  refreshProgress: number;
  refreshComplete: boolean;
  isProcessingClearAll: boolean;
  handleRefreshImages: () => Promise<void>;
  setShowConfirmClearAll: (show: boolean) => void;
}

const ImageRefreshControls = ({ 
  isRefreshingImages, 
  refreshProgress, 
  refreshComplete, 
  isProcessingClearAll,
  handleRefreshImages,
  setShowConfirmClearAll
}: ImageRefreshControlsProps) => {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Button
        onClick={handleRefreshImages}
        disabled={isRefreshingImages}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <RefreshCw className={`h-4 w-4 ${isRefreshingImages ? 'animate-spin' : ''}`} />
        {isRefreshingImages 
          ? 'Rafraîchissement en cours...' 
          : refreshComplete 
            ? 'Rafraîchissement terminé' 
            : 'Vérifier et nettoyer les références d\'images'}
      </Button>

      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="destructive"
            size="sm"
            className="flex items-center gap-2"
            disabled={isProcessingClearAll}
            onClick={() => setShowConfirmClearAll(true)}
          >
            <Trash2 className="h-4 w-4" />
            Supprimer toutes les références d'images
          </Button>
        </DialogTrigger>
      </Dialog>

      {refreshProgress > 0 && !refreshComplete && (
        <span className="text-xs text-gray-500 ml-2">
          Traitement partiel effectué. Cliquez à nouveau pour continuer.
        </span>
      )}
    </div>
  );
};

export default ImageRefreshControls;
