import React, { useEffect, useState } from "react";
import { PlayerWithImage } from "./types";
import PlayerImageCard from "./PlayerImageCard";

interface PlayerImagesListProps {
  filter: string;
  players: PlayerWithImage[];
  onDelete: () => void;
}

const PlayerImagesList: React.FC<PlayerImagesListProps> = ({ 
  filter = "all", 
  players = [],
  onDelete
}) => {
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [filteredPlayers, setFilteredPlayers] = useState<PlayerWithImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Apply filters when the filter or players change
  useEffect(() => {
    setIsLoading(true);
    
    let filtered = [...players];
    
    switch (filter) {
      case "no-image":
        filtered = filtered.filter(p => !p.player.image && !p.newImageUrl);
        break;
      case "with-image":
        filtered = filtered.filter(p => p.player.image || p.newImageUrl);
        break;
      case "pending":
        filtered = filtered.filter(p => p.imageFile && !p.processed);
        break;
      case "processed":
        filtered = filtered.filter(p => p.processed);
        break;
      case "errors":
        filtered = filtered.filter(p => p.error !== null);
        break;
      case "all":
      default:
        // No filter, keep all players
        break;
    }
    
    setFilteredPlayers(filtered);
    setIsLoading(false);
  }, [filter, players]);
  
  // Force refresh when filtered players change
  useEffect(() => {
    console.log("[PlayerImagesList] Players list changed, refreshing components");
    const timer = setTimeout(() => {
      setReloadTrigger(prev => prev + 1);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [filteredPlayers]);

  // More aggressive refresh for recently processed uploads
  useEffect(() => {
    const hasProcessedPlayers = filteredPlayers.some(p => p.processed);
    
    if (hasProcessedPlayers) {
      console.log("[PlayerImagesList] Detected processed player images, scheduling frequent refreshes");
      // Refresh multiple times with progressively increasing delays
      // This helps with Supabase storage propagation delays
      const timeouts = [500, 1000, 2000, 3000, 5000, 8000, 12000, 20000].map(delay => 
        setTimeout(() => {
          console.log(`[PlayerImagesList] Post-upload refresh: ${delay}ms`);
          setReloadTrigger(prev => prev + 1);
        }, delay)
      );
      
      return () => timeouts.forEach(t => clearTimeout(t));
    }
  }, [filteredPlayers]);

  const handleImageDeleted = () => {
    if (onDelete) {
      onDelete();
    }
    
    // More aggressive refresh after deletion
    [500, 1500, 3000, 6000, 10000].forEach(delay => {
      setTimeout(() => {
        console.log(`[PlayerImagesList] Post-deletion refresh: ${delay}ms`);
        setReloadTrigger(prev => prev + 1);
      }, delay);
    });
  };

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
          onImageDeleted={handleImageDeleted}
        />
      ))}
    </div>
  );
};

export default PlayerImagesList;
