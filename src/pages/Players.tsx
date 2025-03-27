
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import PlayerCard from "@/components/PlayerCard";
import SearchBar from "@/components/SearchBar";
import { Player } from "@/utils/models/types";
import { getTeams } from "@/utils/database/teamsService";

const Players = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("All");
  const [selectedRegion, setSelectedRegion] = useState<string>("All");
  const [selectedSubRegion, setSelectedSubRegion] = useState<string>("All");
  const [allPlayers, setAllPlayers] = useState<(Player & { teamName: string; teamRegion: string })[]>([]);
  const [loading, setLoading] = useState(true);
  
  const roles = ["All", "Top", "Jungle", "Mid", "ADC", "Support"];
  // Updated with all major LoL competitive regions
  const regions = [
    "All", 
    "LCK", // Korea
    "LPL", // China
    "LEC", // Europe
    "LTA", // Latin America
    "LCS", // North America
    "PCS", // Pacific
    "VCS", // Vietnam
    "CBLOL", // Brazil
    "LJL", // Japan
    "LCO", // Oceania
    "TCL", // Turkey
    "LCL", // Commonwealth of Independent States
    "LLA", // Latin America
    "LFL", // France
    "LFL2", // France Division 2
    "LVP", // Spain
    "Prime League", // Germany/DACH
    "NLC", // Northern Europe
    "PG Nationals", // Italy
    "Ultraliga", // Poland
    "Greek Legends", // Greece
    "Arabian League", // Arabia
    "Hitpoint Masters", // Czech Republic & Slovakia
    "Elite Series", // Benelux
    "Esports Balkan League", // Balkans
    "Baltic Masters" // Baltic
  ];
  
  const subRegions = {
    LTA: ["All", "LTA N", "LTA S"]
  };
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const teams = await getTeams();
        
        const players = teams.flatMap(team => 
          team.players.map(player => ({
            ...player,
            teamName: team.name,
            teamRegion: team.region
          }))
        );
        
        console.log("Players with team data:", players);
        setAllPlayers(players);
      } catch (error) {
        console.error("Error fetching player data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Reset sub-region when region changes
  useEffect(() => {
    setSelectedSubRegion("All");
  }, [selectedRegion]);
  
  const filteredPlayers = allPlayers.filter(player => {
    // Case-insensitive role matching
    const roleMatches = selectedRole === "All" || 
      player.role.toLowerCase() === selectedRole.toLowerCase();
    
    // Case-insensitive region matching with support for LTA N and LTA S
    let regionMatches = selectedRegion === "All" || 
      player.teamRegion.toUpperCase() === selectedRegion.toUpperCase();
    
    // If LTA is selected, check sub-regions
    if (selectedRegion === "LTA") {
      if (selectedSubRegion === "All") {
        regionMatches = player.teamRegion.startsWith("LTA N") || player.teamRegion.startsWith("LTA S");
      } else {
        regionMatches = player.teamRegion.startsWith(selectedSubRegion);
      }
    }
    
    const searchMatches = 
      player.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      player.teamName.toLowerCase().includes(searchTerm.toLowerCase());
    
    return roleMatches && regionMatches && searchMatches;
  });
  
  const handleSearch = (query: string) => {
    setSearchTerm(query);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Players</h1>
          <p className="text-gray-600">
            Browse and analyze professional League of Legends players
          </p>
        </div>
        
        <div className="mb-8">
          <SearchBar onSearch={handleSearch} />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-6 mb-8">
          <div className="w-full sm:w-auto">
            <h3 className="font-medium mb-2">Filter by Role</h3>
            <div className="flex flex-wrap gap-2">
              {roles.map(role => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    selectedRole === role
                      ? "bg-lol-blue text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
          
          <div className="w-full sm:w-auto">
            <h3 className="font-medium mb-2">Filter by Region</h3>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {regions.map(region => (
                <button
                  key={region}
                  onClick={() => setSelectedRegion(region)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    selectedRegion === region
                      ? "bg-lol-blue text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  {region}
                </button>
              ))}
            </div>
          </div>
          
          {selectedRegion === "LTA" && (
            <div className="w-full sm:w-auto">
              <h3 className="font-medium mb-2">Filter by Sub-Region</h3>
              <div className="flex flex-wrap gap-2">
                {subRegions.LTA.map(subRegion => (
                  <button
                    key={subRegion}
                    onClick={() => setSelectedSubRegion(subRegion)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      selectedSubRegion === subRegion
                        ? "bg-lol-blue text-white"
                        : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                    }`}
                  >
                    {subRegion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {loading ? (
          <div className="text-center py-10">
            <p className="text-gray-500">Loading players...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredPlayers.length > 0 ? (
              filteredPlayers.map((player, index) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <PlayerCard player={player} />
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-10 text-center">
                <p className="text-gray-500">No players found matching your filters.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Players;
