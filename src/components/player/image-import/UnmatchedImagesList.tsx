
import React from "react";
import UnmatchedImageCard from "./UnmatchedImageCard";
import { PlayerWithImage } from "./types";
import { AlertTriangle } from "lucide-react";

interface UnmatchedImagesListProps {
  unmatched: File[];
  playerOptions: PlayerWithImage[];
  onAssign: (file: File, playerIndex: number) => void;
  disabled?: boolean;
}

const UnmatchedImagesList = ({ 
  unmatched, 
  playerOptions, 
  onAssign, 
  disabled = false 
}: UnmatchedImagesListProps) => {
  if (unmatched.length === 0) return null;
  
  const sortedPlayerOptions = [...playerOptions]
    .filter(p => !p.processed && !p.imageFile) // Filtrer pour ne montrer que les joueurs sans image
    .sort((a, b) => a.player.name.localeCompare(b.player.name, 'fr', { sensitivity: 'base' }));

  return (
    <div className="mt-6">
      <div className="mb-3 flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-amber-500" />
        <h3 className="text-lg font-medium">Images non associées ({unmatched.length})</h3>
      </div>
      
      <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
        <p className="text-sm text-amber-800">
          Ces images n'ont pas pu être automatiquement associées à des joueurs par leurs noms. 
          Veuillez sélectionner manuellement un joueur pour chaque image.
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {unmatched.map((file, index) => (
          <UnmatchedImageCard 
            key={`unmatched-${index}`}
            file={file}
            index={index}
            playerOptions={sortedPlayerOptions}
            onAssign={onAssign}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
};

export default UnmatchedImagesList;
