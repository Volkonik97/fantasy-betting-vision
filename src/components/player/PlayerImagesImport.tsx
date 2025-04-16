
import React from "react";
import PlayerImagesImport from "./image-import/PlayerImagesImport";

interface PlayerImagesImportWrapperProps {
  bucketStatus?: "loading" | "exists" | "error";
  rlsEnabled?: boolean;
  showRlsHelp?: () => void;
}

const PlayerImagesImportWrapper = ({
  bucketStatus = "loading",
  rlsEnabled = false,
  showRlsHelp = () => {}
}: PlayerImagesImportWrapperProps) => {
  return (
    <PlayerImagesImport
      bucketStatus={bucketStatus}
      rlsEnabled={rlsEnabled}
      showRlsHelp={showRlsHelp}
    />
  );
};

export default PlayerImagesImportWrapper;
