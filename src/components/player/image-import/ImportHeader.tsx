
import React from "react";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import BucketStatusInfo from "./BucketStatusInfo";
import RlsWarning from "./RlsWarning";

interface ImportHeaderProps {
  bucketStatus: "loading" | "exists" | "error";
  rlsEnabled: boolean;
  showRlsHelp: () => void;
}

const ImportHeader = ({ bucketStatus, rlsEnabled, showRlsHelp }: ImportHeaderProps) => {
  return (
    <CardHeader>
      <CardTitle>Importer des images de joueurs</CardTitle>
      <CardDescription>
        Téléchargez des images pour les joueurs. Les fichiers seront associés aux joueurs selon leur nom.
      </CardDescription>
      
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
