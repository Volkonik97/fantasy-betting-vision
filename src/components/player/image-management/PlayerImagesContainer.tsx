
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  refreshImageReferences, 
  synchronizeReferences,
  checkBucketRlsPermission,
  clearAllPlayerImageReferences
} from "@/utils/database/teams/images";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import BucketStatusInfo from "../image-import/BucketStatusInfo";
import ImageRefreshControls from "./ImageRefreshControls";
import PlayerImagesList from "../image-import/PlayerImagesList";
import UnmatchedImagesList from "../image-import/UnmatchedImagesList";
import UploadControls from "../image-import/UploadControls";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

const PlayerImagesContainer = () => {
  const [activeTab, setActiveTab] = useState("list");
  const [bucketStatus, setBucketStatus] = useState<"loading" | "exists" | "error">("loading");
  const [isRefreshingImages, setIsRefreshingImages] = useState(false);
  const [refreshProgress, setRefreshProgress] = useState(0);
  const [refreshComplete, setRefreshComplete] = useState(false);
  const [isSyncingReferences, setIsSyncingReferences] = useState(false);
  const [isProcessingClearAll, setIsProcessingClearAll] = useState(false);
  const [showConfirmClearAll, setShowConfirmClearAll] = useState(false);
  const [rlsEnabled, setRlsEnabled] = useState(false);
  const [showRlsHelp, setShowRlsHelp] = useState(false);
  
  useEffect(() => {
    const checkBucketStatus = async () => {
      setBucketStatus("loading");
      try {
        const rlsStatus = await checkBucketRlsPermission();
        setRlsEnabled(rlsStatus.enabled);
        
        if (rlsStatus.canAccess) {
          setBucketStatus("exists");
        } else {
          setBucketStatus("error");
        }
      } catch (error) {
        console.error("Error checking bucket status:", error);
        setBucketStatus("error");
      }
    };
    
    checkBucketStatus();
  }, []);
  
  const handleRefreshImages = async () => {
    if (isRefreshingImages) return;
    
    setIsRefreshingImages(true);
    setRefreshComplete(false);
    setRefreshProgress(10);
    
    try {
      const result = await refreshImageReferences();
      
      setRefreshProgress(100);
      setRefreshComplete(true);
      
      if (result.completed) {
        toast.success(
          `Vérification des images terminée: ${result.fixedCount} références corrigées, ${result.orphanedFilesCount} fichiers orphelins détectés`
        );
      } else {
        toast.error("La vérification des images n'a pas pu être terminée");
      }
    } catch (error) {
      console.error("Error refreshing images:", error);
      toast.error("Erreur lors de la vérification des images");
    } finally {
      setIsRefreshingImages(false);
    }
  };
  
  const handleSynchronizeReferences = async () => {
    if (isSyncingReferences) return;
    
    setIsSyncingReferences(true);
    
    try {
      const result = await synchronizeReferences();
      
      if (result.completed) {
        toast.success(
          `Synchronisation terminée: ${result.addedCount} références ajoutées, ${result.removedCount} références supprimées`
        );
      } else {
        toast.error("La synchronisation n'a pas pu être terminée");
      }
    } catch (error) {
      console.error("Error synchronizing references:", error);
      toast.error("Erreur lors de la synchronisation des références");
    } finally {
      setIsSyncingReferences(false);
    }
  };
  
  const handleClearAllImages = async () => {
    setIsProcessingClearAll(true);
    
    try {
      const result = await clearAllPlayerImageReferences();
      
      if (result.success) {
        toast.success(`Toutes les références d'images ont été supprimées (${result.clearedCount})`);
      } else {
        toast.error("Erreur lors de la suppression des références d'images");
      }
    } catch (error) {
      console.error("Error clearing all image references:", error);
      toast.error("Erreur lors de la suppression des références d'images");
    } finally {
      setIsProcessingClearAll(false);
      setShowConfirmClearAll(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Gestionnaire d'images des joueurs</h1>
          <p className="text-gray-500">Gérer, synchroniser et vérifier les images des joueurs</p>
        </div>
        
        <BucketStatusInfo 
          status={bucketStatus} 
          rlsEnabled={rlsEnabled} 
          onRlsHelpClick={() => setShowRlsHelp(true)}
        />
      </div>
      
      <ImageRefreshControls
        isRefreshingImages={isRefreshingImages}
        refreshProgress={refreshProgress}
        refreshComplete={refreshComplete}
        isProcessingClearAll={isProcessingClearAll}
        isSyncingReferences={isSyncingReferences}
        handleRefreshImages={handleRefreshImages}
        handleSynchronizeReferences={handleSynchronizeReferences}
        setShowConfirmClearAll={setShowConfirmClearAll}
      />
      
      {bucketStatus === "error" && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur d'accès au stockage</AlertTitle>
          <AlertDescription>
            Impossible d'accéder au bucket de stockage "player-images". 
            Vérifiez la configuration des droits d'accès ou créez le bucket s'il n'existe pas.
          </AlertDescription>
        </Alert>
      )}
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="list" className="flex-1">Liste des joueurs</TabsTrigger>
          <TabsTrigger value="upload" className="flex-1">Téléchargement</TabsTrigger>
          <TabsTrigger value="unmatched" className="flex-1">Images non associées</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="mt-6">
          <PlayerImagesList status={bucketStatus} />
        </TabsContent>
        
        <TabsContent value="upload" className="mt-6">
          <UploadControls status={bucketStatus} />
        </TabsContent>
        
        <TabsContent value="unmatched" className="mt-6">
          <UnmatchedImagesList status={bucketStatus} />
        </TabsContent>
      </Tabs>
      
      <Dialog open={showConfirmClearAll} onOpenChange={setShowConfirmClearAll}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Voulez-vous vraiment supprimer toutes les références d'images des joueurs ?
              Cette action supprimera également tous les fichiers du stockage.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="flex space-x-2 justify-end">
            <Button 
              variant="outline" 
              onClick={() => setShowConfirmClearAll(false)}
              disabled={isProcessingClearAll}
            >
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleClearAllImages}
              disabled={isProcessingClearAll}
            >
              {isProcessingClearAll ? 'Traitement en cours...' : 'Supprimer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlayerImagesContainer;
