
import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface UploadErrorAlertProps {
  errorCount: number;
  lastError: string | null;
}

const UploadErrorAlert = ({ errorCount, lastError }: UploadErrorAlertProps) => {
  if (errorCount === 0) return null;
  
  return (
    <Alert className="bg-red-50 border-red-100">
      <AlertTriangle className="h-4 w-4 text-red-600" />
      <AlertTitle>Erreurs de téléchargement</AlertTitle>
      <AlertDescription>
        <p>{errorCount} {errorCount > 1 ? 'images ont échoué' : 'image a échoué'} lors du téléchargement.</p>
        {lastError && (
          <p className="text-sm mt-1 font-mono text-red-700 bg-red-50 p-1 rounded overflow-auto max-h-24">
            {lastError}
          </p>
        )}
        <div className="text-xs mt-2 space-y-1">
          <p>Solutions possibles:</p>
          <ul className="list-disc pl-5">
            {lastError?.includes("timeout") || lastError?.includes("délai") ? (
              <>
                <li>Vérifiez votre connexion internet</li>
                <li>Essayez de réduire la taille des images avant de les télécharger</li>
                <li>Téléchargez moins d'images à la fois</li>
              </>
            ) : lastError?.includes("RLS") || lastError?.includes("policy") ? (
              <>
                <li>Vérifiez les politiques RLS du bucket</li>
                <li>Assurez-vous que votre compte a les permissions nécessaires</li>
              </>
            ) : (
              <>
                <li>Vérifiez que le bucket de stockage existe et est accessible</li>
                <li>Essayez de recharger la page et de réessayer</li>
              </>
            )}
          </ul>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default UploadErrorAlert;
