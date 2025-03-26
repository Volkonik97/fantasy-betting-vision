
import React, { useState } from "react";
import { motion } from "framer-motion";
import { matches, tournaments } from "@/utils/mockData";
import Navbar from "@/components/Navbar";
import MatchCard from "@/components/MatchCard";
import SearchBar from "@/components/SearchBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Calendar, Filter } from "lucide-react";
import { format, subDays, isSameDay } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

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

  // Get current matches for pagination
  const getMatchesForCurrentTab = (matches: typeof filteredMatches) => {
    const indexOfLastMatch = currentPage * matchesPerPage;
    const indexOfFirstMatch = indexOfLastMatch - matchesPerPage;
    return matches.slice(indexOfFirstMatch, indexOfLastMatch);
  };

  // Calculate total pages for the current tab
  const getPageCount = (matches: typeof filteredMatches) => {
    return Math.ceil(matches.length / matchesPerPage);
  };

  const renderPagination = (matches: typeof filteredMatches) => {
    const pageCount = getPageCount(matches);
    
    if (pageCount <= 1) return null;
    
    return (
      <Pagination className="mt-8">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
          
          {[...Array(pageCount)].map((_, i) => (
            <PaginationItem key={i}>
              <PaginationLink 
                onClick={() => setCurrentPage(i + 1)}
                isActive={currentPage === i + 1}
              >
                {i + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          
          <PaginationItem>
            <PaginationNext 
              onClick={() => setCurrentPage(p => Math.min(pageCount, p + 1))}
              className={currentPage === pageCount ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Matches</h1>
          <p className="text-gray-600">
            Browse upcoming, live, and past matches with win predictions
          </p>
        </div>
        
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <SearchBar onSearch={handleSearch} value={searchTerm} />
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
                    onSelect={setSelectedDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              
              {(searchTerm || selectedTournament !== "All" || selectedDate) && (
                <Button variant="ghost" onClick={clearFilters} className="h-10">
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </div>
        
        <div className="mb-8 overflow-x-auto">
          <div className="flex flex-nowrap gap-3 pb-2">
            <button
              onClick={() => setSelectedTournament("All")}
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
                onClick={() => setSelectedTournament(tournament.name)}
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
        
        <Tabs defaultValue="upcoming" className="mb-8" onValueChange={() => setCurrentPage(1)}>
          <TabsList className="mb-6">
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingMatches.length})
            </TabsTrigger>
            <TabsTrigger value="live">
              Live ({liveMatches.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedMatches.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {getMatchesForCurrentTab(upcomingMatches).length > 0 ? (
                getMatchesForCurrentTab(upcomingMatches).map((match) => (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <MatchCard match={match} />
                  </motion.div>
                ))
              ) : (
                <p className="text-gray-500 col-span-2 text-center py-10">
                  No upcoming matches found for the selected filters.
                </p>
              )}
            </div>
            {renderPagination(upcomingMatches)}
          </TabsContent>
          
          <TabsContent value="live">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {getMatchesForCurrentTab(liveMatches).length > 0 ? (
                getMatchesForCurrentTab(liveMatches).map((match) => (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <MatchCard match={match} />
                  </motion.div>
                ))
              ) : (
                <p className="text-gray-500 col-span-2 text-center py-10">
                  No live matches at the moment.
                </p>
              )}
            </div>
            {renderPagination(liveMatches)}
          </TabsContent>
          
          <TabsContent value="completed">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {getMatchesForCurrentTab(completedMatches).length > 0 ? (
                getMatchesForCurrentTab(completedMatches).map((match) => (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <MatchCard match={match} />
                  </motion.div>
                ))
              ) : (
                <p className="text-gray-500 col-span-2 text-center py-10">
                  No completed matches found for the selected filters.
                </p>
              )}
            </div>
            {renderPagination(completedMatches)}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Matches;
