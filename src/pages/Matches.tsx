
import React, { useState } from "react";
import { isSameDay } from "date-fns";
import { matches, tournaments } from "@/utils/models";
import Navbar from "@/components/Navbar";
import MatchesHeader from "@/components/matches/MatchesHeader";
import MatchFilters from "@/components/matches/MatchFilters";
import TournamentFilter from "@/components/matches/TournamentFilter";
import MatchesTabs from "@/components/matches/MatchesTabs";

const Matches = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTournament, setSelectedTournament] = useState<string>("All");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const matchesPerPage = 6;
  
  const handleSearch = (query: string) => {
    setSearchTerm(query);
    setCurrentPage(1); // Reset to first page on new search
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedTournament("All");
    setSelectedDate(undefined);
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || selectedTournament !== "All" || selectedDate;

  // Filter matches based on search term, selected tournament, and date
  const filteredMatches = matches.filter(match => {
    const matchesTournament = selectedTournament === "All" || match.tournament === selectedTournament;
    const matchesSearch = 
      match.teamBlue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.teamRed.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.tournament.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchDate = new Date(match.date);
    const matchesDate = !selectedDate || isSameDay(matchDate, selectedDate);
    
    return matchesTournament && matchesSearch && matchesDate;
  });

  // Group matches by status
  const upcomingMatches = filteredMatches.filter(match => match.status === "Upcoming");
  const liveMatches = filteredMatches.filter(match => match.status === "Live");
  const completedMatches = filteredMatches.filter(match => match.status === "Completed");

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 pt-24 pb-12">
        <MatchesHeader 
          onClearFilters={clearFilters}
          searchTerm={searchTerm}
          selectedTournament={selectedTournament}
          selectedDate={selectedDate}
        />
        
        <MatchFilters
          searchTerm={searchTerm}
          selectedDate={selectedDate}
          onSearch={handleSearch}
          onDateSelect={setSelectedDate}
          onClearFilters={clearFilters}
          hasActiveFilters={!!hasActiveFilters}
        />
        
        <TournamentFilter
          tournaments={tournaments}
          selectedTournament={selectedTournament}
          onTournamentChange={setSelectedTournament}
        />
        
        <MatchesTabs
          upcomingMatches={upcomingMatches}
          liveMatches={liveMatches}
          completedMatches={completedMatches}
          currentPage={currentPage}
          matchesPerPage={matchesPerPage}
          onPageChange={setCurrentPage}
          onTabChange={() => setCurrentPage(1)}
        />
      </main>
    </div>
  );
};

export default Matches;
