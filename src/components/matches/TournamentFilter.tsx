
import React from "react";
import { Tournament } from "@/utils/models/types";

interface TournamentFilterProps {
  tournaments: Tournament[];
  selectedTournament: string;
  onTournamentChange: (tournament: string) => void;
}

const TournamentFilter = ({
  tournaments,
  selectedTournament,
  onTournamentChange,
}: TournamentFilterProps) => {
  return (
    <div className="mb-8 overflow-x-auto">
      <div className="flex flex-nowrap gap-3 pb-2">
        <button
          onClick={() => onTournamentChange("All")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
            selectedTournament === "All"
              ? "bg-lol-blue text-white"
              : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
          }`}
        >
          All Tournaments
        </button>
        
        {tournaments.map(tournament => (
          <button
            key={tournament.id}
            onClick={() => onTournamentChange(tournament.name)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
              selectedTournament === tournament.name
                ? "bg-lol-blue text-white"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            {tournament.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TournamentFilter;
