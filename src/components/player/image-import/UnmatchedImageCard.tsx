
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PlayerWithImage } from "./types";

interface UnmatchedImageCardProps {
  file: File;
  playerOptions: PlayerWithImage[];
  onAssign: (file: File, playerId: string) => void;
  disabled?: boolean;
}

const UnmatchedImageCard: React.FC<UnmatchedImageCardProps> = ({
  file,
  playerOptions,
  onAssign,
  disabled = false
}) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Create image preview
  useEffect(() => {
    if (!file) return;
    
    const url = URL.createObjectURL(file);
    setImagePreview(url);
    
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);
  
  const handleAssign = () => {
    if (selectedPlayerId && file) {
      onAssign(file, selectedPlayerId);
    }
  };
  
  // Sort players alphabetically
  const sortedPlayers = [...playerOptions].sort((a, b) => 
    a.player.name.localeCompare(b.player.name)
  );
  
  return (
    <Card className="overflow-hidden">
      <div className="aspect-w-1 aspect-h-1 bg-gray-100">
        {imagePreview && (
          <img
            src={imagePreview}
            alt={file.name}
            className="object-cover w-full h-full"
          />
        )}
      </div>
      
      <CardContent className="p-3">
        <div className="text-sm font-medium mb-2 truncate" title={file.name}>
          {file.name}
        </div>
        
        <div className="space-y-2">
          <Select 
            onValueChange={setSelectedPlayerId} 
            value={selectedPlayerId}
            disabled={disabled}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sélectionner un joueur" />
            </SelectTrigger>
            <SelectContent>
              {sortedPlayers.map((p) => (
                <SelectItem key={p.player.id} value={p.player.id}>
                  {p.player.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            onClick={handleAssign} 
            className="w-full"
            disabled={!selectedPlayerId || disabled}
            size="sm"
          >
            Associer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UnmatchedImageCard;
