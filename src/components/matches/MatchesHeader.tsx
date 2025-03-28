
import React from "react";

interface MatchesHeaderProps {
  onClearFilters: () => void;
  searchTerm: string;
  selectedTournament: string;
  selectedDate: Date | undefined;
}

const MatchesHeader = ({ 
  onClearFilters, 
  searchTerm, 
  selectedTournament, 
  selectedDate 
}: MatchesHeaderProps) => {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold mb-2">Matches</h1>
      <p className="text-gray-600">
        Browse upcoming, live, and past matches with win predictions
      </p>
    </div>
  );
};

export default MatchesHeader;
