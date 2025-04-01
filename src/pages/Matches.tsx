
import React, { useState, useEffect } from "react";
import { isSameDay } from "date-fns";
import Navbar from "@/components/Navbar";
import MatchesHeader from "@/components/matches/MatchesHeader";
import MatchFilters from "@/components/matches/MatchFilters";
import TournamentFilter from "@/components/matches/TournamentFilter";
import MatchesTabs from "@/components/matches/MatchesTabs";
import { getTournaments } from "@/utils/database";
import { getMatches } from "@/utils/database";
import { Match, Tournament } from "@/utils/models/types";
import { toast } from "sonner";

const Matches = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTournament, setSelectedTournament] = useState<string>("All");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  
  const matchesPerPage = 6;
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load tournaments
        const tournamentsList = await getTournaments();
        setTournaments(tournamentsList);
        
        // Load matches
        const matchesList = await getMatches();
        console.log(`Loaded ${matchesList.length} matches from the database`);
        setMatches(matchesList);
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Error loading matches data");
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
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
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lol-blue"></div>
          </div>
        ) : (
          <MatchesTabs
            upcomingMatches={upcomingMatches}
            liveMatches={liveMatches}
            completedMatches={completedMatches}
            currentPage={currentPage}
            matchesPerPage={matchesPerPage}
            onPageChange={setCurrentPage}
            onTabChange={() => setCurrentPage(1)}
          />
        )}
      </main>
    </div>
  );
};

export default Matches;
