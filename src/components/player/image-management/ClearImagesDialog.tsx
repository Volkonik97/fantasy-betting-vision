
import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertCircle, Trash2 } from "lucide-react";

interface ClearImagesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isProcessing: boolean;
  onConfirm: () => Promise<void>;
}

const ClearImagesDialog = ({
  open,
  onOpenChange,
  isProcessing,
  onConfirm
}: ClearImagesDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Confirmer la suppression complète
          </DialogTitle>
          <DialogDescription className="space-y-2 pt-2">
            <div className="bg-amber-50 border-l-4 border-amber-400 p-3 text-amber-800 mb-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold mb-1">Cette action est irréversible</p>
                  <p className="text-sm">Toutes les images des joueurs seront définitivement supprimées.</p>
                </div>
              </div>
            </div>
            
            <p><strong>Cette action va:</strong></p>
            <ul className="list-disc pl-5 space-y-1.5 text-sm">
              <li>Supprimer <strong>toutes</strong> les références d'images dans la base de données</li>
              <li>Supprimer <strong>tous</strong> les fichiers d'images stockés dans le bucket Supabase</li>
            </ul>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-start gap-2 mt-4">
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isProcessing}
            className="gap-2"
          >
            {isProcessing ? (
              <>
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                Suppression en cours...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Confirmer la suppression
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            Annuler
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ClearImagesDialog;
