
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import PlayerImageCard from "./PlayerImageCard";
import { PlayerWithImage } from "./types";

interface PlayerImagesListProps {
  isLoading: boolean;
  filteredPlayers: PlayerWithImage[];
}

const PlayerImagesList = ({ isLoading, filteredPlayers }: PlayerImagesListProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="border rounded-lg p-3 flex items-center space-x-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {filteredPlayers
        .sort((a, b) => a.player.name.localeCompare(b.player.name, 'fr', { sensitivity: 'base' }))
        .map((playerData) => (
          <PlayerImageCard key={playerData.player.id} playerData={playerData} />
        ))
      }
    </div>
  );
};

export default PlayerImagesList;
