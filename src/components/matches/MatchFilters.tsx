
import React from "react";
import { format } from "date-fns";
import { Calendar } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

interface MatchFiltersProps {
  searchTerm: string;
  selectedDate: Date | undefined;
  onSearch: (query: string) => void;
  onDateSelect: (date: Date | undefined) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

const MatchFilters = ({
  searchTerm,
  selectedDate,
  onSearch,
  onDateSelect,
  onClearFilters,
  hasActiveFilters,
}: MatchFiltersProps) => {
  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-grow">
          <SearchBar onSearch={onSearch} value={searchTerm} />
        </div>
        
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 h-10">
                <Calendar className="h-4 w-4" />
                {selectedDate ? format(selectedDate, "MMM dd, yyyy") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={onDateSelect}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          
          {hasActiveFilters && (
            <Button variant="ghost" onClick={onClearFilters} className="h-10">
              Clear Filters
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchFilters;
