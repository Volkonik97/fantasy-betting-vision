
import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RlsWarningProps {
  showRlsHelp: () => void;
}

const RlsWarning = ({ showRlsHelp }: RlsWarningProps) => {
  return (
    <Alert className="mt-3 bg-amber-50 border-amber-100">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertTitle>Problème de politiques RLS</AlertTitle>
      <AlertDescription>
        <p>Le téléchargement d'images va probablement échouer car les politiques RLS ne permettent pas le stockage de fichiers.</p>
        <p className="text-sm mt-1">Contactez l'administrateur du projet pour configurer correctement les politiques RLS.</p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={showRlsHelp}
          className="mt-2"
        >
          Comment configurer RLS
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default RlsWarning;
