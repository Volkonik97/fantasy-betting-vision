
import React from "react";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import BucketStatusInfo from "./BucketStatusInfo";
import RlsWarning from "./RlsWarning";

interface ImportHeaderProps {
  bucketStatus: "loading" | "exists" | "error";
  rlsEnabled: boolean;
  showRlsHelp: () => void;
  unmatched: File[];
  totalPlayers: number;
  pendingUpload: number;
}

const ImportHeader = ({ 
  bucketStatus, 
  rlsEnabled, 
  showRlsHelp,
  unmatched,
  totalPlayers,
  pendingUpload
}: ImportHeaderProps) => {
  return (
    <CardHeader>
      <CardTitle>Importer des images de joueurs</CardTitle>
      <CardDescription>
        Téléchargez des images pour les joueurs. Les fichiers seront associés aux joueurs selon leur nom.
      </CardDescription>
      
      <div className="flex flex-wrap gap-2 mt-2">
        {unmatched.length > 0 && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
            {unmatched.length} non associées
          </span>
        )}
        
        {pendingUpload > 0 && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {pendingUpload} en attente
          </span>
        )}
        
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {totalPlayers} joueurs
        </span>
      </div>
      
      <BucketStatusInfo 
        status={bucketStatus} 
        rlsEnabled={rlsEnabled}
        onRlsHelpClick={showRlsHelp}
      />
      
      {rlsEnabled && (
        <RlsWarning showRlsHelp={showRlsHelp} />
      )}
    </CardHeader>
  );
};

export default ImportHeader;
