
import React, { useEffect, useState } from "react";
import { PlayerWithImage } from "./types";
import PlayerImageCard from "./PlayerImageCard";

interface PlayerImagesListProps {
  isLoading?: boolean;
  filteredPlayers?: PlayerWithImage[];
  status?: "loading" | "exists" | "error";
  onImageDeleted?: () => void;
}

const PlayerImagesList: React.FC<PlayerImagesListProps> = ({ 
  isLoading = false, 
  filteredPlayers = [],
  status = "loading",
  onImageDeleted
}) => {
  const [reloadTrigger, setReloadTrigger] = useState(0);
  
  // Force refresh when filtered players change to ensure images are loaded correctly
  useEffect(() => {
    // Small delay to ensure the DOM has updated
    const timer = setTimeout(() => {
      setReloadTrigger(prev => prev + 1);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [filteredPlayers]);

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <p>Chargement des joueurs...</p>
      </div>
    );
  }

  if (!filteredPlayers || filteredPlayers.length === 0) {
    return (
      <div className="p-8 text-center">
        <p>Aucun joueur ne correspond aux critères sélectionnés.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {filteredPlayers.map((item) => (
        <PlayerImageCard 
          key={`${item.player.id}-${reloadTrigger}`}
          playerData={item} 
          onImageDeleted={onImageDeleted}
        />
      ))}
    </div>
  );
};

export default PlayerImagesList;
