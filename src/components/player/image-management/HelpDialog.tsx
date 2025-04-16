
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertCircle, ExternalLink } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

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
                  Pour résoudre ce problème, un administrateur doit créer le bucket "Player Images" dans le dashboard Supabase:
                </p>
                
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Connectez-vous au dashboard Supabase</li>
                  <li>Naviguer vers "Storage" dans le menu</li>
                  <li>Cliquer sur "New Bucket"</li>
                  <li>Créer un bucket nommé exactement "Player Images" (avec l'espace)</li>
                  <li>Définir le bucket comme public</li>
                </ol>
                
                <Button 
                  className="mt-3 w-full flex items-center justify-center gap-2"
                  onClick={() => window.open("https://supabase.com/dashboard/project/dtddoxxazhmfudrvpszu/storage/buckets", "_blank")}
                >
                  <ExternalLink className="h-4 w-4" />
                  Ouvrir le dashboard Supabase
                </Button>
                
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
                  Pour résoudre ce problème, un administrateur doit modifier les politiques RLS du bucket "Player Images" 
                  dans la console Supabase pour permettre les actions suivantes :
                </p>
                
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Ouvrir le dashboard Supabase</li>
                  <li>Aller dans "Storage"</li>
                  <li>Sélectionner le bucket "Player Images"</li>
                  <li>Cliquer sur l'onglet "Policies"</li>
                  <li>Créer des politiques pour:
                    <ul className="list-disc pl-5 mt-1">
                      <li>INSERT - Pour télécharger des images</li>
                      <li>SELECT - Pour lister les images</li>
                      <li>UPDATE - Pour mettre à jour les images (optionnel)</li>
                      <li>DELETE - Pour supprimer les images (optionnel)</li>
                    </ul>
                  </li>
                </ol>
                
                <div className="bg-amber-50 border border-amber-200 rounded p-3 my-3">
                  <p className="font-medium">Exemple de politique simple</p>
                  <p className="text-xs font-mono mt-1">
                    Pour SELECT: <code>(bucket_id = 'Player Images')::</code> défini sur TRUE<br />
                    Pour INSERT: <code>(bucket_id = 'Player Images')::</code> défini sur TRUE
                  </p>
                </div>
                
                <Button 
                  className="mt-1 w-full flex items-center justify-center gap-2"
                  onClick={() => window.open("https://supabase.com/dashboard/project/dtddoxxazhmfudrvpszu/storage/buckets", "_blank")}
                >
                  <ExternalLink className="h-4 w-4" />
                  Configurer les politiques RLS
                </Button>
                
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
