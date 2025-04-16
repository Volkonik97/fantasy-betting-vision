
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
          <DialogDescription className="space-y-2">
            <p><strong>Cette action va:</strong></p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Supprimer <strong>toutes</strong> les références d'images dans la base de données</li>
              <li>Supprimer <strong>tous</strong> les fichiers d'images stockés dans le bucket Supabase</li>
            </ul>
            <p className="text-destructive font-medium mt-2">Cette action ne peut pas être annulée.</p>
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
