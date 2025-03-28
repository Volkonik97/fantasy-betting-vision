
import React from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface TeamPageHeaderProps {
  showLogoUploader: boolean;
  toggleLogoUploader: () => void;
}

const TeamPageHeader: React.FC<TeamPageHeaderProps> = ({ 
  showLogoUploader, 
  toggleLogoUploader 
}) => {
  return (
    <div className="mb-8 flex justify-between items-start">
      <div>
        <h1 className="text-3xl font-bold mb-2">Teams</h1>
        <p className="text-gray-600">
          Browse and analyze all professional League of Legends teams
        </p>
      </div>
      
      <Button
        variant="outline"
        className="flex items-center gap-2"
        onClick={toggleLogoUploader}
      >
        <Upload size={16} />
        {showLogoUploader ? "Hide Logo Uploader" : "Upload Team Logos"}
      </Button>
    </div>
  );
};

export default TeamPageHeader;
