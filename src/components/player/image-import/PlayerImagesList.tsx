
import React, { useState } from "react";
import { PlayerWithImage } from "./types";
import PlayerImageCard from "./PlayerImageCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface PlayerImagesListProps {
  filteredPlayers: PlayerWithImage[];
  isLoading: boolean;
}

const PlayerImagesList: React.FC<PlayerImagesListProps> = ({ filteredPlayers, isLoading }) => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const displayedPlayers = searchQuery 
    ? filteredPlayers.filter(p => 
        p.player.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredPlayers;

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
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          type="text"
          placeholder="Rechercher un joueur..."
          className="pl-8 w-full max-w-xs"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="absolute right-1 top-1 h-8"
            onClick={() => setSearchQuery("")}
          >
            Effacer
          </Button>
        )}
      </div>
      
      {displayedPlayers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Aucun joueur ne correspond à votre recherche
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayedPlayers.map((playerData) => (
            <PlayerImageCard 
              key={playerData.player.id} 
              playerData={playerData} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PlayerImagesList;
