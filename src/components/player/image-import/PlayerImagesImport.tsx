
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
    <div className="space-y-8">
      <ImportHeader
        bucketStatus={bucketStatus}
        rlsEnabled={rlsEnabled}
        showRlsHelp={showRlsHelp}
        unmatched={unmatched}
        totalPlayers={playerImages.length}
        pendingUpload={pendingUploadCount}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <DropZone onDrop={handleFileSelect} />
              
              <div className="mt-6">
                <UploadControls
                  uploadImages={uploadImages}
                  uploadStatus={uploadStatus}
                  bucketStatus={bucketStatus}
                />
              </div>
            </CardContent>
          </Card>

          <UnmatchedImagesList
            files={unmatched}
            onMatch={assignFileToPlayer}
            players={playerImages}
            status={bucketStatus}
          />
        </div>

        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
            <CardContent className="pt-6">
              <PlayerStats players={playerImages} />
            </CardContent>
          </Card>

          <UploadSummary status={uploadStatus} />
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <PlayerImagesFilter
            activeTab={filterTab}
            onChange={setFilterTab}
            players={playerImages}
          />
          
          <div className="mt-6">
            <PlayerImagesList
              filter={filterTab}
              players={playerImages}
              onDelete={handleImageDeleted}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlayerImagesImport;
