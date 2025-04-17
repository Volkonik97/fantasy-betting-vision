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
  showRlsHelp = () => {}
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
    refreshPlayerImages
  } = usePlayerImages();

  const handleUpload = () => {
    uploadImages(bucketStatus === "exists");
  };

  const handleImageDeleted = () => {
    // Refresh the player list when an image is deleted
    refreshPlayerImages();
  };

  // Count players with images ready to upload
  const pendingUploadCount = playerImages.filter(p => p.imageFile && !p.processed).length;

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center space-y-4 py-12">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">{loadingProgress.message}</h3>
            <div className="w-full bg-gray-200 rounded-full h-2.5 max-w-md">
              <div 
                className="bg-blue-500 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
                style={{ width: `${loadingProgress.percent}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Chargement des données des joueurs... Cela peut prendre un moment.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <ImportHeader 
        bucketStatus={bucketStatus} 
        rlsEnabled={rlsEnabled}
        showRlsHelp={showRlsHelp}
      />
      
      <CardContent className="space-y-4">
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          <div className="md:col-span-2">
            <DropZone 
              onFileSelect={handleFileSelect}
              disabled={bucketStatus !== "exists" || rlsEnabled || uploadStatus.inProgress}
            />
          </div>
          <div className="md:col-span-1">
            <PlayerStats playerImages={playerImages} className="h-full" />
          </div>
        </div>

        {uploadStatus.failed > 0 && (
          <UploadSummary
            uploadStatus={uploadStatus}
            failedPlayers={playerImages.filter(p => p.error !== null)}
          />
        )}

        <UploadControls 
          onUpload={handleUpload}
          disabled={bucketStatus !== "exists" || rlsEnabled || pendingUploadCount === 0}
          isUploading={uploadStatus.inProgress}
          uploadProgress={uploadStatus.total > 0 ? Math.round((uploadStatus.processed / uploadStatus.total) * 100) : 0}
          status={bucketStatus}
          uploadCount={pendingUploadCount}
        />

        {unmatched.length > 0 && (
          <UnmatchedImagesList 
            unmatched={unmatched}
            playerOptions={playerImages}
            onAssign={assignFileToPlayer}
            disabled={uploadStatus.inProgress}
            status={bucketStatus}
          />
        )}

        <PlayerImagesFilter 
          activeTab={filterTab} 
          setActiveTab={setFilterTab} 
          playerImages={playerImages}
        >
          <PlayerImagesList 
            isLoading={isLoading} 
            filteredPlayers={playerImages.filter(player => {
              switch(filterTab) {
                case 'no-image':
                  return !player.player.image && !player.newImageUrl;
                case 'with-image':
                  return player.player.image || player.newImageUrl;
                case 'pending':
                  return player.imageFile && !player.processed;
                case 'processed':
                  return player.processed;
                case 'errors':
                  return player.error !== null;
                default:
                  return true; // 'all' tab
              }
            })} 
            status={bucketStatus}
            onImageDeleted={handleImageDeleted}
          />
        </PlayerImagesFilter>
      </CardContent>
    </Card>
  );
};

export default PlayerImagesImport;
