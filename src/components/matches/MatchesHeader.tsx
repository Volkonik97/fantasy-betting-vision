
import React from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

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
  const hasFilters = searchTerm || selectedTournament !== "All" || selectedDate;
  
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-3xl font-bold">Matches</h1>
        
        {hasFilters && (
          <button 
            onClick={onClearFilters}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
            Clear all filters
          </button>
        )}
      </div>
      
      <p className="text-gray-600 mb-2">
        Browse upcoming, live, and past matches with win predictions
      </p>
      
      {/* Active filters display */}
      {hasFilters && (
        <div className="flex flex-wrap gap-2 mt-3">
          {searchTerm && (
            <Badge variant="secondary" className="px-3 py-1">
              Search: {searchTerm}
            </Badge>
          )}
          
          {selectedTournament !== "All" && (
            <Badge variant="secondary" className="px-3 py-1">
              Tournament: {selectedTournament}
            </Badge>
          )}
          
          {selectedDate && (
            <Badge variant="secondary" className="px-3 py-1">
              Date: {format(selectedDate, "MMM d, yyyy")}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default MatchesHeader;
