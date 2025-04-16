
import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { PlayerWithImage, UploadStatus } from "./types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface UploadSummaryProps {
  uploadStatus: UploadStatus;
  failedPlayers: PlayerWithImage[];
}

const UploadSummary = ({ uploadStatus, failedPlayers }: UploadSummaryProps) => {
  if (uploadStatus.failed === 0) return null;
  
  // Grouper les erreurs par type pour les solutions
  const timeoutErrors = failedPlayers.filter(p => 
    p.error?.toLowerCase().includes("délai") || 
    p.error?.toLowerCase().includes("timeout")
  ).length;
  
  const rlsErrors = failedPlayers.filter(p => 
    p.error?.toLowerCase().includes("rls") || 
    p.error?.toLowerCase().includes("policy") ||
    p.error?.toLowerCase().includes("permission")
  ).length;
  
  return (
    <Alert className="bg-red-50 border-red-100">
      <AlertTriangle className="h-4 w-4 text-red-600" />
      <AlertTitle>Erreurs de téléchargement</AlertTitle>
      <AlertDescription className="space-y-2">
        <p>
          {uploadStatus.failed} {uploadStatus.failed > 1 ? 'images ont échoué' : 'image a échoué'} lors du téléchargement.
        </p>
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="errors">
            <AccordionTrigger className="text-sm font-medium text-red-700">
              Voir les détails des erreurs
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 text-sm">
                {failedPlayers.map((player, index) => (
                  <div key={index} className="p-2 bg-red-100 rounded">
                    <p className="font-medium">{player.player.name}</p>
                    <p className="text-xs font-mono">{player.error}</p>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        
        <div className="text-xs mt-2 space-y-1">
          <p className="font-medium">Solutions possibles:</p>
          <ul className="list-disc pl-5">
            {timeoutErrors > 0 && (
              <>
                <li>Vérifiez votre connexion internet</li>
                <li>Essayez de réduire la taille des images avant de les télécharger</li>
                <li>Téléchargez moins d'images à la fois</li>
              </>
            )}
            {rlsErrors > 0 && (
              <>
                <li>Vérifiez les politiques RLS du bucket</li>
                <li>Assurez-vous que votre compte a les permissions nécessaires</li>
              </>
            )}
            <li>Vérifiez que le bucket de stockage existe et est accessible</li>
            <li>Essayez de recharger la page et de réessayer</li>
          </ul>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default UploadSummary;
