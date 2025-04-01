
import React from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface UploadControlsProps {
  onUpload: () => void;
  disableUpload: boolean;
  isUploading: boolean;
  uploadProgress: number;
}

const UploadControls = ({ onUpload, disableUpload, isUploading, uploadProgress }: UploadControlsProps) => {
  return (
    <div className="space-y-2">
      <Button 
        onClick={onUpload} 
        className="w-full" 
        disabled={disableUpload || isUploading}
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
