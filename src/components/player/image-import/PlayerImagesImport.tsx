import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import ImportHeader from "./ImportHeader";
import DropZone from "./DropZone";
import UploadControls from "./UploadControls";
import UnmatchedImagesList from "./UnmatchedImagesList";
import PlayerImagesFilter from "./PlayerImagesFilter";
import PlayerImagesList from "./PlayerImagesList";
import { usePlayerImages } from "./usePlayerImages";
import UploadSummary from "./UploadSummary";
import PlayerStats from "./PlayerStats";

interface PlayerImagesImportProps {
  bucketStatus: "loading" | "exists" | "error";
  rlsEnabled: boolean;
  showRlsHelp: () => void;
}

const PlayerImagesImport = ({
  bucketStatus = "loading",
  rlsEnabled = false,
  showRlsHelp = () => {},
}: PlayerImagesImportProps) => {
  const {
    playerImages,
    unmatched,
    isLoading,
    uploadStatus,
    loadingProgress,
    handleFileSelect,
    assignFileToPlayer,
    uploadImages,
    filterTab,
    setFilterTab,
    refreshPlayerImages,
  } = usePlayerImages();

  const handleImageDeleted = () => {
    refreshPlayerImages();
  };

  const pendingUploadCount = playerImages.filter(
    (p) => p.imageFile && !p.processed
  ).length;

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center space-y-4 py-12">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">
              {loadingProgress.message}
            </h3>
            <div className="w-full bg-gray-200 rounded-full h-2.5 max-w-md">
              <div
                className="bg-blue-500 h-2.5 rounded-full transition-all duration-300 ease-in-out"
                style={{ width: `${loadingProgress.percent}%` }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <ImportHeader
        unmatched={unmatched}
        totalPlayers={playerImages.length}
        pendingUpload={pendingUploadCount}
      />

      <DropZone onDrop={handleFileSelect} />

      <UploadControls
        uploadImages={uploadImages}
        uploadStatus={uploadStatus}
        bucketStatus={bucketStatus}
      />

      <UnmatchedImagesList
        files={unmatched}
        onMatch={assignFileToPlayer}
        players={playerImages}
      />

      <PlayerImagesFilter
        activeTab={filterTab}
        onChange={setFilterTab}
        players={playerImages}
      />

      <PlayerImagesList
        filter={filterTab}
        players={playerImages}
        onDelete={handleImageDeleted}
      />

      <UploadSummary status={uploadStatus} />
      <PlayerStats players={playerImages} />
    </div>
  );
};

export default PlayerImagesImport;
