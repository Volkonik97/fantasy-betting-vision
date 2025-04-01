
import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Check } from "lucide-react";

interface BucketStatusInfoProps {
  bucketExists: boolean | null;
  rlsStatus: {
    checked: boolean;
    canUpload: boolean;
    canList: boolean;
  };
}

const BucketStatusInfo = ({ bucketExists, rlsStatus }: BucketStatusInfoProps) => {
  if (bucketExists === false) {
    return (
      <div className="p-3 mt-2 bg-red-50 text-red-700 rounded-md border border-red-200">
        <p className="font-medium">Le bucket de stockage n'est pas accessible</p>
        <p className="text-sm">Impossible de télécharger des images pour le moment.</p>
      </div>
    );
  }
  
  if (bucketExists === true) {
    return (
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
    );
  }
  
  return null;
};

export default BucketStatusInfo;
