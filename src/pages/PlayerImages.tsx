
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import PlayerImagesImport from "@/components/player/PlayerImagesImport";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Check, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const PlayerImages = () => {
  const [bucketStatus, setBucketStatus] = useState<"loading" | "exists" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isRetrying, setIsRetrying] = useState(false);
  
  const checkBucket = async () => {
    setBucketStatus("loading");
    setErrorMessage("");
    
    try {
      const { data, error } = await supabase.storage.getBucket("player-images");
      
      if (error) {
        console.error("Error accessing player-images bucket:", error);
        setBucketStatus("error");
        setErrorMessage(error.message);
      } else {
        console.log("Bucket player-images accessible:", data);
        setBucketStatus("exists");
        toast.success("Connexion au bucket réussie");
      }
    } catch (error) {
      console.error("Exception checking bucket:", error);
      setBucketStatus("error");
      setErrorMessage(error instanceof Error ? error.message : String(error));
    }
  };
  
  const handleRetry = async () => {
    setIsRetrying(true);
    await checkBucket();
    setIsRetrying(false);
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
            <Alert className="bg-green-50 border-green-100 mb-6">
              <Check className="h-4 w-4 text-green-600" />
              <AlertTitle>Prêt pour le téléchargement</AlertTitle>
              <AlertDescription>
                Le bucket de stockage est accessible. Vous pouvez télécharger des images de joueurs.
              </AlertDescription>
            </Alert>
          )}
          
          {bucketStatus === "error" && (
            <Alert className="bg-red-50 border-red-100 mb-6">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertTitle>Erreur d'accès au stockage</AlertTitle>
              <AlertDescription>
                <p>Une erreur s'est produite lors de l'accès au bucket de stockage: {errorMessage}</p>
                <div className="mt-4 space-y-4">
                  <p className="text-sm">
                    Si l'erreur persiste, contactez votre administrateur Supabase pour vérifier que:
                  </p>
                  <ul className="list-disc ml-5 mt-1 text-sm space-y-1">
                    <li>Le bucket "player-images" existe</li>
                    <li>Les politiques d'accès sont correctement configurées</li>
                    <li>Votre clé API a les permissions nécessaires</li>
                  </ul>
                  <div className="pt-2">
                    <Button 
                      onClick={handleRetry}
                      disabled={isRetrying}
                      variant="outline" 
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
                      {isRetrying ? 'Vérification en cours...' : 'Réessayer la connexion'}
                    </Button>
                  </div>
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
          <PlayerImagesImport />
        </motion.div>
      </main>
    </div>
  );
};

export default PlayerImages;
