
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

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
  bucketStatus?: "loading" | "exists" | "error";
  rlsEnabled?: boolean;
  showRlsHelp?: () => void;
}

const PlayerImagesImport = ({
  bucketStatus = "loading",
  rlsEnabled = false,
  showRlsHelp = () => {}
}: PlayerImagesImportProps) => {
  const [bucketExists, setBucketExists] = useState<boolean | null>(null);
  const {
    playerImages,
    unmatched,
    isLoading,
    uploadStatus,
    handleFileSelect,
    assignFileToPlayer,
    uploadImages
  } = usePlayerImages();
  
  const [activeTab, setActiveTab] = useState<string>("all");

  useEffect(() => {
    if (bucketStatus === "exists") {
      setBucketExists(true);
    } else if (bucketStatus === "error") {
      setBucketExists(false);
    }
  }, [bucketStatus]);

  const handleUpload = () => {
    uploadImages(bucketExists === true);
  };

  const getFilteredPlayers = () => {
    switch (activeTab) {
      case "no-image":
        return playerImages.filter(p => !p.player.image && !p.newImageUrl);
      case "with-image":
        return playerImages.filter(p => p.player.image || p.newImageUrl);
      case "pending":
        return playerImages.filter(p => p.imageFile && !p.processed);
      case "processed":
        return playerImages.filter(p => p.processed);
      case "errors":
        return playerImages.filter(p => p.error !== null);
      case "all":
      default:
        return playerImages;
    }
  };

  const filteredPlayers = getFilteredPlayers();
  const disableUpload = bucketExists === false || 
                          rlsEnabled || 
                          playerImages.filter(p => p.imageFile !== null && !p.processed).length === 0 ||
                          uploadStatus.inProgress;

  return (
    <Card className="w-full">
      <ImportHeader 
        bucketExists={bucketExists} 
        rlsEnabled={rlsEnabled}
        showRlsHelp={showRlsHelp}
      />
      
      <CardContent className="space-y-4">
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          <div className="md:col-span-2">
            <DropZone 
              onFileSelect={handleFileSelect}
              disabled={bucketExists === false || rlsEnabled || uploadStatus.inProgress}
            />
          </div>
          
          <div className="md:col-span-1">
            <PlayerStats 
              playerImages={playerImages} 
              className="h-full"
            />
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
          disableUpload={disableUpload}
          isUploading={uploadStatus.inProgress}
          uploadProgress={uploadStatus.total > 0 ? Math.round((uploadStatus.processed / uploadStatus.total) * 100) : 0}
        />

        {unmatched.length > 0 && (
          <UnmatchedImagesList 
            unmatched={unmatched}
            playerOptions={playerImages}
            onAssign={assignFileToPlayer}
            disabled={uploadStatus.inProgress}
          />
        )}

        <Separator className="my-4" />

        <PlayerImagesFilter
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          playerImages={playerImages}
        >
          <PlayerImagesList 
            isLoading={isLoading} 
            filteredPlayers={filteredPlayers} 
          />
        </PlayerImagesFilter>
      </CardContent>
    </Card>
  );
};

export default PlayerImagesImport;
