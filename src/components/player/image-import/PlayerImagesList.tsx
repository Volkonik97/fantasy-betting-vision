
import React from "react";
import { Player } from "@/utils/models/types";
import PlayerImageCard from "./PlayerImageCard";

interface PlayerImagesListProps {
  isLoading?: boolean;
  filteredPlayers?: any[];
  status?: "loading" | "exists" | "error";
}

const PlayerImagesList: React.FC<PlayerImagesListProps> = ({ 
  isLoading = false, 
  filteredPlayers = [],
  status = "loading"
}) => {
  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <p>Chargement des joueurs...</p>
      </div>
    );
  }

  if (filteredPlayers.length === 0) {
    return (
      <div className="p-8 text-center">
        <p>Aucun joueur ne correspond aux critères sélectionnés.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {filteredPlayers.map((item) => (
        <PlayerImageCard key={item.player.playerid} playerImage={item} />
      ))}
    </div>
  );
};

export default PlayerImagesList;
