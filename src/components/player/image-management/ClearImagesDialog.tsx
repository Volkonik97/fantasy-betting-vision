
import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertCircle } from "lucide-react";

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
            <AlertCircle className="h-5 w-5" />
            Confirmer la suppression
          </DialogTitle>
          <DialogDescription>
            Vous êtes sur le point de supprimer toutes les références d'images dans la base de données
            <strong className="block mt-2">et tous les fichiers d'images associés dans le stockage Supabase.</strong>
            Cette action ne peut pas être annulée.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-start gap-2 mt-4">
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? "Suppression en cours..." : "Confirmer la suppression"}
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
