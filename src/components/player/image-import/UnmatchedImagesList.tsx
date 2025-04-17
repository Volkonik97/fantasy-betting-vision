
import React from "react";
import UnmatchedImageCard from "./UnmatchedImageCard";
import { PlayerWithImage } from "./types";

interface UnmatchedImagesListProps {
  files: File[];
  players: PlayerWithImage[];
  onMatch: (file: File, playerId: string) => void;
  disabled?: boolean;
  status?: "loading" | "exists" | "error";
}

const UnmatchedImagesList: React.FC<UnmatchedImagesListProps> = ({ 
  files, 
  players, 
  onMatch, 
  disabled = false,
  status = "loading"
}) => {
  if (files.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium mb-3">Images non associées ({files.length})</h3>
      <p className="text-sm text-gray-500 mb-4">
        Ces images n'ont pas pu être associées automatiquement à un joueur. 
        Sélectionnez manuellement le joueur pour chaque image.
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {files.map((file, index) => (
          <UnmatchedImageCard
            key={index}
            file={file}
            playerOptions={players}
            onAssign={onMatch}
            disabled={disabled || status !== "exists"}
          />
        ))}
      </div>
    </div>
  );
};

export default UnmatchedImagesList;
