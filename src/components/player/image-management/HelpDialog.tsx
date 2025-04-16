
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
                  Pour résoudre ce problème, vous devez créer le bucket "player-images" dans le dashboard Supabase:
                </p>
                
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Connectez-vous au dashboard Supabase</li>
                  <li>Naviguer vers "Storage" dans le menu</li>
                  <li>Cliquer sur "New Bucket"</li>
                  <li>Créer un bucket nommé exactement "player-images"</li>
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
                  Si vous venez de créer le bucket, cliquez sur "Vérifier le bucket" en haut à droite pour rafraîchir la page.
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
                  Pour résoudre ce problème, vous devez ajouter des politiques RLS au bucket "player-images" 
                  dans la console Supabase pour permettre les actions suivantes:
                </p>
                
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Ouvrir le dashboard Supabase</li>
                  <li>Aller dans "Storage" puis "Buckets"</li>
                  <li>Sélectionner le bucket "player-images"</li>
                  <li>Cliquer sur l'onglet "Policies"</li>
                  <li>Pour chaque opération (INSERT, SELECT, UPDATE, DELETE):
                    <ol className="list-decimal pl-5 mt-1">
                      <li>Cliquer sur "Add Policy"</li>
                      <li>Sélectionner l'opération (INSERT, SELECT, etc.)</li>
                      <li>Donner un nom à la politique (ex: "Allow uploads to player-images")</li>
                      <li>Dans la définition de la politique, saisir simplement: <code className="bg-gray-100 px-1 rounded">bucket_id = 'player-images'</code></li>
                      <li>Cliquer sur "Review" puis "Save Policy"</li>
                    </ol>
                  </li>
                </ol>
                
                <div className="bg-amber-50 border border-amber-200 rounded p-3 my-3">
                  <p className="font-medium">Politiques recommandées</p>
                  <p className="text-xs mt-1">
                    Pour un accès complet (sans authentification requise), utilisez simplement:
                  </p>
                  <p className="text-xs font-mono mt-1 bg-gray-100 p-1 rounded">
                    Pour toutes les opérations: <code>bucket_id = 'player-images'</code>
                  </p>
                  <p className="text-xs mt-2">
                    Pour limiter l'accès aux utilisateurs authentifiés:
                  </p>
                  <p className="text-xs font-mono mt-1 bg-gray-100 p-1 rounded">
                    <code>bucket_id = 'player-images' AND auth.role() = 'authenticated'</code>
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
