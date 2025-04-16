
import React, { useState } from "react";
import { PlayerWithImage } from "./types";
import { AlertCircle, CornerRightDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UnmatchedImageCardProps {
  file: File;
  playerOptions: PlayerWithImage[];
  onAssign: (file: File, playerIndex: number) => void;
  disabled?: boolean;
}

const UnmatchedImageCard = ({ 
  file, 
  playerOptions, 
  onAssign, 
  disabled = false
}: UnmatchedImageCardProps) => {
  const [selectedPlayerIndex, setSelectedPlayerIndex] = useState<number>(-1);

  const handleAssign = () => {
    if (selectedPlayerIndex >= 0) {
      onAssign(file, selectedPlayerIndex);
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${disabled ? 'bg-gray-100 opacity-70' : 'bg-amber-50 border-amber-200'}`}>
      <div className="h-28 bg-white rounded flex items-center justify-center overflow-hidden mb-3">
        <img 
          src={URL.createObjectURL(file)} 
          alt={file.name}
          className="max-h-full max-w-full object-contain"
        />
      </div>
      
      <div className="flex items-start space-x-2 mb-2">
        <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
        <p className="text-xs font-medium text-amber-700 truncate">{file.name}</p>
      </div>
      
      <div className="space-y-2">
        <select 
          className="w-full text-xs p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          onChange={(e) => setSelectedPlayerIndex(parseInt(e.target.value))}
          value={selectedPlayerIndex}
          disabled={disabled}
        >
          <option value="-1">Sélectionnez un joueur...</option>
          {playerOptions.map((playerData, idx) => (
            <option key={playerData.player.id} value={idx}>
              {playerData.player.name} ({playerData.player.role || 'Rôle inconnu'})
            </option>
          ))}
        </select>
        
        <Button 
          onClick={handleAssign} 
          size="sm" 
          variant="outline"
          className="w-full text-xs"
          disabled={selectedPlayerIndex < 0 || disabled}
        >
          <CornerRightDown className="h-3 w-3 mr-1" />
          Associer
        </Button>
      </div>
    </div>
  );
};

export default UnmatchedImageCard;
