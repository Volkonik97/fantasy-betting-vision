
import React from "react";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import BucketStatusInfo from "./BucketStatusInfo";
import RlsWarning from "./RlsWarning";

interface ImportHeaderProps {
  bucketExists: boolean | null;
  rlsEnabled: boolean;
  showRlsHelp: () => void;
}

const ImportHeader = ({ bucketExists, rlsEnabled, showRlsHelp }: ImportHeaderProps) => {
  const rlsStatus = {
    checked: rlsEnabled !== undefined,
    canUpload: !rlsEnabled,
    canList: !rlsEnabled
  };

  return (
    <CardHeader>
      <CardTitle>Importer des images de joueurs</CardTitle>
      <CardDescription>
        Téléchargez des images pour les joueurs. Les fichiers seront associés aux joueurs selon leur nom.
      </CardDescription>
      
      <BucketStatusInfo 
        bucketExists={bucketExists} 
        rlsStatus={rlsStatus}
      />
      
      {rlsEnabled && (
        <RlsWarning showRlsHelp={showRlsHelp} />
      )}
    </CardHeader>
  );
};

export default ImportHeader;
