
import React from "react";
import UnmatchedImageCard from "./UnmatchedImageCard";
import { PlayerWithImage } from "./types";

interface UnmatchedImagesListProps {
  unmatched: File[];
  playerOptions: PlayerWithImage[];
  onAssign: (file: File, playerIndex: number) => void;
}

const UnmatchedImagesList = ({ unmatched, playerOptions, onAssign }: UnmatchedImagesListProps) => {
  if (unmatched.length === 0) return null;
  
  const sortedPlayerOptions = [...playerOptions].sort((a, b) => 
    a.player.name.localeCompare(b.player.name, 'fr', { sensitivity: 'base' })
  );

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-2">Images non associées ({unmatched.length})</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {unmatched.map((file, index) => (
          <UnmatchedImageCard 
            key={`unmatched-${index}`}
            file={file}
            index={index}
            playerOptions={sortedPlayerOptions}
            onAssign={onAssign}
          />
        ))}
      </div>
    </div>
  );
};

export default UnmatchedImagesList;
