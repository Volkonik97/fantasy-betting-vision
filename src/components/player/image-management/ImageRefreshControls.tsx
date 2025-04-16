
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Trash2 } from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

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
    <div className="space-y-3 mb-4">
      <div className="flex flex-wrap gap-2 items-center">
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
              disabled={isProcessingClearAll || isRefreshingImages}
              onClick={() => setShowConfirmClearAll(true)}
            >
              <Trash2 className="h-4 w-4" />
              Supprimer toutes les références d'images
            </Button>
          </DialogTrigger>
        </Dialog>
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
