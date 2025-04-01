
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface HelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "bucket" | "rls";
  rlsErrorMessage?: string | null;
}

const HelpDialog = ({ open, onOpenChange, type, rlsErrorMessage }: HelpDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {type === "bucket" ? "Problème d'accès au bucket" : "Problème de permissions RLS"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {type === "bucket" ? (
            <>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  L'accès au bucket de stockage a échoué
                </AlertDescription>
              </Alert>
              
              <div className="text-sm space-y-2">
                <p>
                  Pour résoudre ce problème, veuillez vérifier les points suivants :
                </p>
                
                <ul className="list-disc pl-5 space-y-1">
                  <li>Vérifiez que le bucket "player-images" existe dans votre projet Supabase</li>
                  <li>Assurez-vous que les politiques d'accès du bucket permettent l'accès aux utilisateurs anonymes</li>
                  <li>Vérifiez que la clé API Supabase a les permissions nécessaires</li>
                </ul>
                
                <p className="pt-2">
                  Si vous venez de créer le bucket, veuillez rafraîchir la page après quelques secondes.
                </p>
              </div>
            </>
          ) : (
            <>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Problème de permissions RLS pour le bucket
                </AlertDescription>
              </Alert>
              
              <div className="text-sm space-y-2">
                <p>
                  La politique de sécurité Row Level Security (RLS) du bucket de stockage bloque l'accès.
                </p>
                
                <p>
                  Pour résoudre ce problème, vous devez modifier les politiques RLS du bucket "player-images" 
                  dans la console Supabase pour permettre les actions suivantes :
                </p>
                
                <ul className="list-disc pl-5 space-y-1">
                  <li>INSERT - Pour télécharger des images</li>
                  <li>SELECT - Pour lister les images</li>
                </ul>
                
                {rlsErrorMessage && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Message d'erreur: {rlsErrorMessage}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HelpDialog;
