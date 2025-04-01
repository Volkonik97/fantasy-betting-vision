
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import PlayerImagesImport from "@/components/player/PlayerImagesImport";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Check, RefreshCw, ExternalLink, RefreshCcw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { refreshImageReferences } from "@/utils/database/teams/imageUtils";

const PlayerImages = () => {
  const [bucketStatus, setBucketStatus] = useState<"loading" | "exists" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isRefreshingImages, setIsRefreshingImages] = useState(false);
  const [refreshProgress, setRefreshProgress] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [refreshComplete, setRefreshComplete] = useState(false);
  
  const checkBucket = async () => {
    setBucketStatus("loading");
    setErrorMessage("");
    
    try {
      // First try to list files in the bucket to check if it exists and is accessible
      const { data: listData, error: listError } = await supabase.storage
        .from('player-images')
        .list('', { limit: 1 });
      
      if (listError) {
        console.error("Error listing files in player-images bucket:", listError);
        
        // Secondary check by getting bucket info
        const { data: bucketData, error: bucketError } = await supabase.storage.getBucket('player-images');
        
        if (bucketError) {
          console.error("Error accessing player-images bucket:", bucketError);
          setBucketStatus("error");
          setErrorMessage(bucketError.message);
        } else {
          console.log("Bucket player-images exists but might have restricted permissions:", bucketData);
          setBucketStatus("exists");
          toast.info("Le bucket existe mais pourrait avoir des restrictions d'accès");
        }
      } else {
        console.log("Bucket player-images accessible, files found:", listData);
        setBucketStatus("exists");
        toast.success("Connexion au bucket réussie");
      }
    } catch (error) {
      console.error("Exception checking bucket:", error);
      setBucketStatus("error");
      setErrorMessage(error instanceof Error ? error.message : String(error));
    }
  };
  
  const handleRefreshImages = async () => {
    if (bucketStatus !== "exists") {
      toast.error("Le bucket de stockage doit être accessible pour rafraîchir les images");
      return;
    }
    
    setIsRefreshingImages(true);
    setRefreshComplete(false);
    setRefreshProgress(0);
    
    try {
      const { fixedCount, completed } = await refreshImageReferences();
      
      if (completed) {
        setRefreshComplete(true);
        if (fixedCount > 0) {
          toast.success(`${fixedCount} références d'images incorrectes ont été supprimées`);
        } else {
          toast.info("Aucune référence d'image incorrecte n'a été trouvée");
        }
      } else {
        // If not complete, show partial progress
        setRefreshProgress(50);
        toast.info(`Traitement en cours: ${fixedCount} références corrigées jusqu'à présent`);
        
        // Do not automatically retry - force manual retry
        toast.info("Pour traiter plus de références, cliquez à nouveau sur le bouton de rafraîchissement");
      }
    } catch (error) {
      console.error("Error refreshing image references:", error);
      toast.error("Erreur lors du rafraîchissement des références d'images");
    } finally {
      setIsRefreshingImages(false);
    }
  };
  
  useEffect(() => {
    checkBucket();
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Gestion des images des joueurs</h1>
          <p className="text-gray-600">
            Importez et gérez les photos des joueurs. Les images seront automatiquement associées aux joueurs selon leur nom de fichier.
          </p>
          
          <div className="mt-4">
            <Button
              onClick={checkBucket}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCcw className="h-4 w-4" />
              Vérifier l'accès au bucket
            </Button>
          </div>
        </motion.div>
        
        {/* Bucket status section */}
        <div className="mb-6">
          {bucketStatus === "loading" && (
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-64" />
                </div>
              </div>
            </div>
          )}
          
          {bucketStatus === "exists" && (
            <>
              <Alert className="bg-green-50 border-green-100 mb-3">
                <Check className="h-4 w-4 text-green-600" />
                <AlertTitle>Prêt pour le téléchargement</AlertTitle>
                <AlertDescription>
                  Le bucket de stockage est accessible. Vous pouvez télécharger des images de joueurs.
                </AlertDescription>
              </Alert>
              
              <div className="mb-4">
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
                <p className="mt-2 text-xs text-gray-500">
                  Cela vérifiera toutes les images de joueurs et supprimera les références aux images qui n'existent plus dans le stockage.
                  {refreshProgress > 0 && !refreshComplete && (
                    <span className="block mt-1 font-medium">
                      Traitement partiel effectué. Cliquez à nouveau pour continuer.
                    </span>
                  )}
                </p>
              </div>
            </>
          )}
          
          {bucketStatus === "error" && (
            <Alert className="bg-red-50 border-red-100 mb-6">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertTitle>Erreur d'accès au stockage</AlertTitle>
              <AlertDescription>
                <p>Une erreur s'est produite lors de l'accès au bucket de stockage: {errorMessage}</p>
                <div className="mt-4">
                  <Button 
                    variant="secondary" 
                    onClick={() => setShowHelp(true)}
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Comment créer le bucket manuellement
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className={bucketStatus !== "exists" ? "opacity-50 pointer-events-none" : ""}
        >
          <PlayerImagesImport bucketStatus={bucketStatus} />
        </motion.div>
      </main>

      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Comment créer le bucket "player-images"</DialogTitle>
            <DialogDescription>
              Suivez ces étapes pour créer manuellement le bucket de stockage dans Supabase.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
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
            
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Note importante</AlertTitle>
              <AlertDescription>
                Vous devez avoir des droits d'administration sur le projet Supabase pour créer des buckets. Assurez-vous également que les politiques RLS adéquates sont en place pour permettre l'accès public aux images.
              </AlertDescription>
            </Alert>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setShowHelp(false)}>Fermer</Button>
            <Button 
              variant="outline" 
              onClick={() => {
                window.open(`https://supabase.com/dashboard/project/dtddoxxazhmfudrvpszu/storage`, '_blank');
              }}
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Ouvrir Supabase Storage
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlayerImages;
