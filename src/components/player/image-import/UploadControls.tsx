
import React from "react";
import { Button } from "@/components/ui/button";
import { UploadStatus } from "./types";
import UploadProgress from "./UploadProgress";

export default function UploadControls({
  uploadImages,
  uploadStatus,
  bucketStatus
}: {
  uploadImages: (bucketExists: boolean) => void;
  uploadStatus: UploadStatus;
  bucketStatus: "loading" | "exists" | "error";
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={() => uploadImages(bucketStatus === "exists")}
          disabled={uploadStatus.inProgress || bucketStatus !== "exists"}
        >
          {uploadStatus.inProgress
            ? "Téléchargement en cours..."
            : "Uploader toutes les images"}
        </Button>
      </div>
      <UploadProgress status={uploadStatus} />
    </div>
  );
}
