
import React from "react";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { Alert, AlertTriangle, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface HelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "bucket" | "rls";
  rlsErrorMessage?: string | null;
}

const HelpDialog = ({ open, onOpenChange, type, rlsErrorMessage }: HelpDialogProps) => {
  const isBucketHelp = type === "bucket";
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isBucketHelp 
              ? "Comment créer le bucket \"player-images\""
              : "Configuration des politiques RLS pour Storage"
            }
          </DialogTitle>
          <DialogDescription>
            {isBucketHelp
              ? "Suivez ces étapes pour créer manuellement le bucket de stockage dans Supabase."
              : "Voici comment configurer les politiques de sécurité RLS pour permettre le téléchargement d'images."
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {isBucketHelp ? (
            <ol className="list-decimal pl-5 space-y-2">
              <li>Connectez-vous à votre <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">tableau de bord Supabase</a></li>
              <li>Sélectionnez votre projet <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">dtddoxxazhmfudrvpszu</span></li>
              <li>Cliquez sur "Storage" dans le menu de gauche</li>
              <li>Cliquez sur le bouton "New Bucket"</li>
              <li>Nommez le bucket <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">player-images</span></li>
              <li>Cochez "Public bucket" pour permettre l'accès public aux images</li>
              <li>Cliquez sur "Create bucket"</li>
              <li>Revenez à cette page et actualisez-la pour vérifier si le bucket est accessible</li>
            </ol>
          ) : (
            <>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Erreur RLS détectée</AlertTitle>
                <AlertDescription>
                  {rlsErrorMessage || "Les politiques RLS empêchent le téléchargement d'images dans le bucket player-images."}
                </AlertDescription>
              </Alert>

              <p className="text-sm">Pour corriger ce problème, vous devez créer des politiques RLS appropriées pour le bucket <code>player-images</code>:</p>
              
              <div className="bg-gray-50 p-3 rounded border text-xs font-mono overflow-auto">
                <pre>{`-- Dans l'éditeur SQL de Supabase, exécutez:

-- Politique permettant à tous d'insérer des fichiers (pour le téléchargement)
CREATE POLICY "Allow public uploads to player-images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'player-images');

-- Politique permettant à tous de lire les fichiers (pour afficher les images)
CREATE POLICY "Allow public read from player-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'player-images');

-- Politique permettant à tous de mettre à jour des fichiers (si nécessaire)
CREATE POLICY "Allow public updates to player-images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'player-images');

-- Politique permettant à tous de supprimer des fichiers (si nécessaire)
CREATE POLICY "Allow public deletes from player-images"
ON storage.objects FOR DELETE
USING (bucket_id = 'player-images');`}</pre>
              </div>
            </>
          )}
          
          <Alert className={isBucketHelp ? "mt-4" : ""}>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Note importante</AlertTitle>
            <AlertDescription>
              {isBucketHelp
                ? "Vous devez avoir des droits d'administration sur le projet Supabase pour créer des buckets. Assurez-vous également que les politiques RLS adéquates sont en place pour permettre l'accès public aux images."
                : "Une fois ces politiques créées, vérifiez à nouveau l'accès au bucket en cliquant sur le bouton \"Vérifier l'accès au bucket\"."
              }
            </AlertDescription>
          </Alert>
        </div>
        
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Fermer</Button>
          <Button 
            variant="outline" 
            onClick={() => {
              window.open(`https://supabase.com/dashboard/project/dtddoxxazhmfudrvpszu/storage${isBucketHelp ? '/buckets' : ''}`, '_blank');
            }}
            className="flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Ouvrir Supabase Storage
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default HelpDialog;
