
import React, { useState } from "react";
import { motion } from "framer-motion";
import { matches, tournaments } from "@/utils/mockData";
import Navbar from "@/components/Navbar";
import MatchCard from "@/components/MatchCard";
import SearchBar from "@/components/SearchBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Matches = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTournament, setSelectedTournament] = useState<string>("All");
  
  const handleSearch = (query: string) => {
    setSearchTerm(query);
  };

  // Filter matches based on search term and selected tournament
  const filteredMatches = matches.filter(match => {
    const matchesTournament = selectedTournament === "All" || match.tournament === selectedTournament;
    const matchesSearch = 
      match.teamBlue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.teamRed.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.tournament.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesTournament && matchesSearch;
  });

  // Group matches by status
  const upcomingMatches = filteredMatches.filter(match => match.status === "Upcoming");
  const liveMatches = filteredMatches.filter(match => match.status === "Live");
  const completedMatches = filteredMatches.filter(match => match.status === "Completed");

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
          <SearchBar onSearch={handleSearch} />
        </div>
        
        <div className="mb-8">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedTournament("All")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
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
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
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
        
        <Tabs defaultValue="upcoming" className="mb-8">
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
              {upcomingMatches.length > 0 ? (
                upcomingMatches.map((match) => (
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
          </TabsContent>
          
          <TabsContent value="live">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {liveMatches.length > 0 ? (
                liveMatches.map((match) => (
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
          </TabsContent>
          
          <TabsContent value="completed">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {completedMatches.length > 0 ? (
                completedMatches.map((match) => (
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
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Matches;
