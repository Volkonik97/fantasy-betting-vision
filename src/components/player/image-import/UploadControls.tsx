
import React from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface UploadControlsProps {
  onUpload?: () => void;
  disabled?: boolean;
  isUploading?: boolean;
  uploadProgress?: number;
  status?: "loading" | "exists" | "error";
  uploadCount?: number;
}

const UploadControls: React.FC<UploadControlsProps> = ({ 
  onUpload = () => {}, 
  disabled = false, 
  isUploading = false, 
  uploadProgress = 0,
  status = "loading",
  uploadCount = 0
}) => {
  const isDisabled = disabled || isUploading || status !== "exists";
  
  return (
    <div className="space-y-2">
      <Button 
        onClick={onUpload} 
        className="w-full" 
        disabled={isDisabled}
      >
        {isUploading ? 'Téléchargement en cours...' : `Télécharger les images${uploadCount > 0 ? ` (${uploadCount})` : ''}`}
      </Button>
      
      {isUploading && (
        <div className="space-y-1">
          <Progress value={uploadProgress} className="h-2" />
          <p className="text-xs text-center text-muted-foreground">
            Ne pas actualiser la page pendant le téléchargement
          </p>
        </div>
      )}
    </div>
  );
};

export default UploadControls;
