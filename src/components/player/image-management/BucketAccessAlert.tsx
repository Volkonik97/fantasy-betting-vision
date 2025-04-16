
import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Check, Database, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface BucketAccessAlertProps {
  bucketStatus: "loading" | "exists" | "error";
  errorMessage: string;
  rlsStatus: { 
    checked: boolean; 
    canUpload: boolean; 
    canList: boolean; 
    message: string | null;
  };
  onShowHelp: () => void;
}

const BucketAccessAlert = ({ bucketStatus, errorMessage, rlsStatus, onShowHelp }: BucketAccessAlertProps) => {
  if (bucketStatus === "loading") return null;

  if (bucketStatus === "exists") {
    return (
      <>
        {rlsStatus.checked && !rlsStatus.canUpload && (
          <Alert className="bg-amber-50 border-amber-100 mb-3">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="flex items-center gap-2">
              Problème de permissions RLS
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Shield className="h-4 w-4 text-amber-500" />
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="text-xs max-w-xs">
                      Row Level Security (RLS) détermine quelles données chaque utilisateur peut voir ou modifier.
                      Les restrictions actuelles empêchent le téléchargement d'images.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </AlertTitle>
            <AlertDescription>
              <p>
                Le bucket existe mais les politiques de sécurité RLS empêchent le téléchargement d'images.
                {rlsStatus.message && <span className="block mt-1 text-sm">{rlsStatus.message}</span>}
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onShowHelp} 
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
          <AlertTitle className="flex items-center gap-2">
            Bucket disponible
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Database className="h-4 w-4 text-green-500" />
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-xs max-w-xs">
                    Le bucket Supabase est un espace de stockage dédié aux fichiers, comme les images de joueurs.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </AlertTitle>
          <AlertDescription>
            Le bucket de stockage est accessible. Vous pouvez télécharger des images de joueurs.
            {rlsStatus.checked && !rlsStatus.canUpload && (
              <span className="block mt-1 text-amber-600 font-medium">
                Note: Le téléchargement échouera en raison des restrictions RLS.
              </span>
            )}
          </AlertDescription>
        </Alert>
      </>
    );
  }

  if (bucketStatus === "error") {
    return (
      <Alert className="bg-red-50 border-red-100 mb-6">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertTitle className="flex items-center gap-2">
          Erreur d'accès au stockage
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Database className="h-4 w-4 text-red-500" />
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs max-w-xs">
                  Le bucket "player-images" est nécessaire pour stocker les images des joueurs.
                  Il semble qu'il n'existe pas ou est inaccessible.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </AlertTitle>
        <AlertDescription>
          <p>Une erreur s'est produite lors de l'accès au bucket de stockage: {errorMessage}</p>
          <div className="mt-4">
            <Button 
              variant="secondary" 
              onClick={onShowHelp}
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Comment créer le bucket manuellement
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};

export default BucketAccessAlert;
