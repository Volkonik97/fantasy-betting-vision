
import React from "react";
import { PlayerWithImage } from "./types";

interface UnmatchedImageCardProps {
  file: File;
  index: number;
  playerOptions: PlayerWithImage[];
  onAssign: (file: File, playerIndex: number) => void;
}

const UnmatchedImageCard = ({ file, index, playerOptions, onAssign }: UnmatchedImageCardProps) => {
  return (
    <div key={`unmatched-${index}`} className="border rounded-lg p-3">
      <div className="mb-2 h-24 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
        <img 
          src={URL.createObjectURL(file)} 
          alt={file.name}
          className="max-h-full max-w-full"
        />
      </div>
      <p className="text-xs font-medium truncate mb-1">{file.name}</p>
      <select 
        className="w-full text-xs p-1 border rounded"
        onChange={(e) => {
          const selectedIndex = parseInt(e.target.value);
          if (selectedIndex >= 0) {
            onAssign(file, selectedIndex);
          }
        }}
        defaultValue="-1"
      >
        <option value="-1">Associer à un joueur...</option>
        {playerOptions.map((playerData, idx) => (
          <option key={playerData.player.id} value={idx}>
            {playerData.player.name} ({playerData.player.role})
          </option>
        ))}
      </select>
    </div>
  );
};

export default UnmatchedImageCard;
