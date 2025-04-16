import React, { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlayerWithImage } from "./types";

interface UnmatchedImageCardProps {
  file: File;
  playerOptions: PlayerWithImage[];
  onAssign: (file: File, playerIndex: number) => void;
  disabled?: boolean;
}

const UnmatchedImageCard: React.FC<UnmatchedImageCardProps> = ({ 
  file, 
  playerOptions, 
  onAssign,
  disabled = false
}) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("");
  const imageUrl = URL.createObjectURL(file);

  // Trier les options de joueurs par ordre alphabétique
  const sortedPlayerOptions = useMemo(() => 
    [...playerOptions].sort((a, b) => a.player.name.localeCompare(b.player.name)), 
    [playerOptions]
  );

  const handleAssign = () => {
    const playerIndex = playerOptions.findIndex(p => p.player.id === selectedPlayerId);
    if (playerIndex !== -1) {
      onAssign(file, playerIndex);
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="aspect-square w-full relative bg-gray-100">
        <img 
          src={imageUrl} 
          alt={file.name} 
          className="w-full h-full object-cover"
          onLoad={() => URL.revokeObjectURL(imageUrl)}
        />
      </div>
      
      <CardContent className="p-4 space-y-3">
        <p className="text-sm font-medium truncate" title={file.name}>
          {file.name}
        </p>
        
        <div className="space-y-2">
          <Select 
            value={selectedPlayerId} 
            onValueChange={setSelectedPlayerId}
            disabled={disabled}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Associer à un joueur" />
            </SelectTrigger>
            <SelectContent>
              {sortedPlayerOptions.map((option) => (
                <SelectItem key={option.player.id} value={option.player.id}>
                  {option.player.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            variant="secondary" 
            className="w-full" 
            onClick={handleAssign}
            disabled={!selectedPlayerId || disabled}
          >
            Associer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UnmatchedImageCard;
