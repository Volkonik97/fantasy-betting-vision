
import React from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface UploadControlsProps {
  onUpload?: () => void;
  disabled?: boolean;
  isUploading?: boolean;
  uploadProgress?: number;
  status?: "loading" | "exists" | "error";
}

const UploadControls: React.FC<UploadControlsProps> = ({ 
  onUpload = () => {}, 
  disabled = false, 
  isUploading = false, 
  uploadProgress = 0,
  status = "loading"
}) => {
  const isDisabled = disabled || isUploading || status !== "exists";
  
  return (
    <div className="space-y-2">
      <Button 
        onClick={onUpload} 
        className="w-full" 
        disabled={isDisabled}
      >
        {isUploading ? 'Téléchargement en cours' : 'Télécharger les images'}
      </Button>
      
      {isUploading && (
        <Progress value={uploadProgress} className="h-2" />
      )}
    </div>
  );
};

export default UploadControls;
