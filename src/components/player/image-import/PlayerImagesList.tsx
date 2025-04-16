
import React from "react";
import { PlayerWithImage } from "./types";
import PlayerImageCard from "./PlayerImageCard";
import { Skeleton } from "@/components/ui/skeleton";

interface PlayerImagesListProps {
  filteredPlayers: PlayerWithImage[];
  isLoading: boolean;
}

const PlayerImagesList: React.FC<PlayerImagesListProps> = ({ filteredPlayers, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="space-y-3 border rounded-lg p-4">
            <div className="flex justify-center">
              <Skeleton className="w-20 h-20 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  if (filteredPlayers.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Aucun joueur trouvé dans cette catégorie
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {filteredPlayers.map((playerData) => (
        <PlayerImageCard 
          key={playerData.player.id} 
          playerData={playerData} 
        />
      ))}
    </div>
  );
};

export default PlayerImagesList;
