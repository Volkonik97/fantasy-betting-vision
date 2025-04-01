import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import PlayerImagesImport from "@/components/player/PlayerImagesImport";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Check, RefreshCw, ExternalLink, RefreshCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { 
  refreshImageReferences, 
  clearAllPlayerImageReferences, 
  checkBucketRlsPermission 
} from "@/utils/database/teams/imageUtils";

const PlayerImages = () => {
  const [bucketStatus, setBucketStatus] = useState<"loading" | "exists" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [rlsStatus, setRlsStatus] = useState<{ 
    checked: boolean, 
    canUpload: boolean, 
    canList: boolean, 
    message: string | null 
  }>({
    checked: false,
    canUpload: false,
    canList: false,
    message: null
  });
  const [isRefreshingImages, setIsRefreshingImages] = useState(false);
  const [isProcessingClearAll, setIsProcessingClearAll] = useState(false);
  const [refreshProgress, setRefreshProgress] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [showConfirmClearAll, setShowConfirmClearAll] = useState(false);
  const [refreshComplete, setRefreshComplete] = useState(false);
  const [showRlsHelp, setShowRlsHelp] = useState(false);
  
  const checkBucket = async () => {
    setBucketStatus("loading");
    setErrorMessage("");
    
    try {
      const { data: listData, error: listError } = await supabase.storage
        .from('player-images')
        .list('', { limit: 1 });
      
      if (listError) {
        console.error("Error listing files in player-images bucket:", listError);
        
        const { data: bucketData, error: bucketError } = await supabase.storage.getBucket('player-images');
        
        if (bucketError) {
          console.error("Error accessing player-images bucket:", bucketError);
          setBucketStatus("error");
          setErrorMessage(bucketError.message);
        } else {
          console.log("Bucket player-images exists but might have restricted permissions:", bucketData);
          setBucketStatus("exists");
          toast.info("Le bucket existe mais pourrait avoir des restrictions d'accès");
          
          checkRlsPermissions();
        }
      } else {
        console.log("Bucket player-images accessible, files found:", listData);
        setBucketStatus("exists");
        toast.success("Connexion au bucket réussie");
        
        checkRlsPermissions();
      }
    } catch (error) {
      console.error("Exception checking bucket:", error);
      setBucketStatus("error");
      setErrorMessage(error instanceof Error ? error.message : String(error));
    }
  };

  const checkRlsPermissions = async () => {
    const result = await checkBucketRlsPermission();
    setRlsStatus({
      checked: true,
      canUpload: result.canUpload,
      canList: result.canList,
      message: result.errorMessage
    });
    
    if (!result.canUpload) {
      toast.error("Problème de permissions RLS: Impossible de télécharger des images");
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
        setRefreshProgress(50);
        toast.info(`Traitement en cours: ${fixedCount} références corrigées jusqu'à présent`);
        
        toast.info("Pour traiter plus de références, cliquez à nouveau sur le bouton de rafraîchissement");
      }
    } catch (error) {
      console.error("Error refreshing image references:", error);
      toast.error("Erreur lors du rafraîchissement des références d'images");
    } finally {
      setIsRefreshingImages(false);
    }
  };

  const handleClearAllImageReferences = async () => {
    setIsProcessingClearAll(true);
    
    try {
      const { success, clearedCount } = await clearAllPlayerImageReferences();
      
      if (success) {
        toast.success(`${clearedCount} références d'images ont été supprimées avec succès`);
        setShowConfirmClearAll(false);
      } else {
        toast.error("Erreur lors de la suppression des références d'images");
      }
    } catch (error) {
      console.error("Error clearing all image references:", error);
      toast.error("Une erreur s'est produite lors de la suppression des références d'images");
    } finally {
      setIsProcessingClearAll(false);
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
        
        <div className="mb-6">
          {bucketStatus === "loading" && (
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-gray-200 animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-4 w-48 bg-gray-200 animate-pulse"></div>
                  <div className="h-4 w-64 bg-gray-200 animate-pulse"></div>
                </div>
              </div>
            </div>
          )}
          
          {bucketStatus === "exists" && (
            <>
              {rlsStatus.checked && !rlsStatus.canUpload && (
                <Alert className="bg-amber-50 border-amber-100 mb-3">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertTitle>Problème de permissions RLS</AlertTitle>
                  <AlertDescription>
                    <p>
                      Le bucket existe mais les politiques de sécurité RLS empêchent le téléchargement d'images.
                      {rlsStatus.message && <span className="block mt-1 text-sm">{rlsStatus.message}</span>}
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowRlsHelp(true)} 
                      className="mt-2 flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Comment configurer RLS
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              <Alert className={`${rlsStatus.checked && !rlsStatus.canUpload ? 'bg-gray-50 border-gray-100' : 'bg-green-50 border-green-100'} mb-3`}>
                <Check className={`h-4 w-4 ${rlsStatus.checked && !rlsStatus.canUpload ? 'text-gray-600' : 'text-green-600'}`} />
                <AlertTitle>Prêt pour le téléchargement</AlertTitle>
                <AlertDescription>
                  Le bucket de stockage est accessible. Vous pouvez télécharger des images de joueurs.
                  {rlsStatus.checked && !rlsStatus.canUpload && (
                    <span className="block mt-1 text-amber-600 font-medium">
                      Note: Le téléchargement échouera en raison des restrictions RLS.
                    </span>
                  )}
                </AlertDescription>
              </Alert>
              
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

                <Dialog open={showConfirmClearAll} onOpenChange={setShowConfirmClearAll}>
                  <DialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex items-center gap-2"
                      disabled={isProcessingClearAll}
                    >
                      <Trash2 className="h-4 w-4" />
                      Supprimer toutes les références d'images
                    </Button>
                  </DialogTrigger>
                  
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirmer la suppression</DialogTitle>
                      <DialogDescription>
                        Cette action va supprimer toutes les références d'images dans la base de données.
                        Les fichiers dans le bucket resteront intacts mais ne seront plus liés aux joueurs.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="pt-4 pb-2">
                      <p className="text-red-600">
                        Attention: Cette action ne peut pas être annulée!
                      </p>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowConfirmClearAll(false)}>
                        Annuler
                      </Button>
                      <Button 
                        variant="destructive"
                        onClick={handleClearAllImageReferences}
                        disabled={isProcessingClearAll}
                        className="flex items-center gap-2"
                      >
                        {isProcessingClearAll ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Traitement...
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4" />
                            Confirmer la suppression
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              
              <p className="mb-4 text-xs text-gray-500">
                La vérification permet de détecter les références d'images invalides et les supprimer.
                Le bouton rouge supprimera toutes les références d'images dans la base de données.
                {refreshProgress > 0 && !refreshComplete && (
                  <span className="block mt-1 font-medium">
                    Traitement partiel effectué. Cliquez à nouveau pour continuer.
                  </span>
                )}
              </p>
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
          <PlayerImagesImport 
            bucketStatus={bucketStatus}
            rlsEnabled={rlsStatus.checked && !rlsStatus.canUpload}
            showRlsHelp={() => setShowRlsHelp(true)}
          />
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

      <Dialog open={showRlsHelp} onOpenChange={setShowRlsHelp}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Configuration des politiques RLS pour Storage</DialogTitle>
            <DialogDescription>
              Voici comment configurer les politiques de sécurité RLS pour permettre le téléchargement d'images.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Erreur RLS détectée</AlertTitle>
              <AlertDescription>
                {rlsStatus.message || "Les politiques RLS empêchent le téléchargement d'images dans le bucket player-images."}
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
            
            <p className="text-sm mt-4">Une fois ces politiques créées, vérifiez à nouveau l'accès au bucket en cliquant sur le bouton "Vérifier l'accès au bucket".</p>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setShowRlsHelp(false)}>Fermer</Button>
            <Button 
              variant="outline" 
              onClick={() => {
                window.open(`https://supabase.com/dashboard/project/dtddoxxazhmfudrvpszu/storage/buckets`, '_blank');
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
