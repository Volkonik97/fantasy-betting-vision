
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
          <p className="text-sm mt-1 font-mono text-red-700 bg-red-50 p-1 rounded">{lastError}</p>
        )}
        <p className="text-xs mt-1">
          Si l'erreur mentionne "violates row-level security policy", vérifiez les politiques RLS du bucket.
        </p>
      </AlertDescription>
    </Alert>
  );
};

export default UploadErrorAlert;
