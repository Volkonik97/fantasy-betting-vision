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
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [allPlayers, setAllPlayers] = useState<(Player & { teamName: string; teamRegion: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [availableRegions, setAvailableRegions] = useState<string[]>([]);
  
  const roles = ["All", "Top", "Jungle", "Mid", "ADC", "Support"];
  
  // Organized regions by category
  const regionCategories = {
    "All": ["All"],
    "Ligues Majeures": ["LCK", "LPL", "LTA N", "LEC"],
    "ERL": ["LFL", "PRM", "LVP SL", "NLC", "LIT", "TCL", "RL", "HLL", "LPLOL", "HW", "EBL"],
    "Division 2": ["LCKC", "LFL2", "LRS", "LRN", "NEXO", "CD"],
    "Autres": ["LCP", "LJL", "LTA N", "PCS", "VCS"]
  };
  
  // All regions flattened for direct searching
  const allRegions = Object.values(regionCategories).flat();
  
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
        
        // Extract unique regions from the teams data
        const uniqueRegions = [...new Set(teams.map(team => team.region))].filter(Boolean);
        console.log("Available regions in database:", uniqueRegions);
        setAvailableRegions(uniqueRegions);
        
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
    
    // Case-insensitive region matching with category support
    let regionMatches = true;
    
    if (selectedCategory !== "All") {
      // If a category is selected but no specific region
      if (selectedRegion === "All") {
        // Check if player's region is in the selected category
        regionMatches = regionCategories[selectedCategory].some(region => 
          region === "All" || player.teamRegion.toUpperCase() === region.toUpperCase()
        );
      } else {
        // Specific region selected
        regionMatches = player.teamRegion.toUpperCase() === selectedRegion.toUpperCase();
      }
    } else if (selectedRegion !== "All") {
      // Direct region selection when no category is chosen
      regionMatches = player.teamRegion.toUpperCase() === selectedRegion.toUpperCase();
    }
    
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

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setSelectedRegion("All"); // Reset region when changing category
  };

  const handleRegionSelect = (region: string) => {
    setSelectedRegion(region);
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
        
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="w-full md:w-auto">
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
          
          <div className="w-full md:w-auto">
            <h3 className="font-medium mb-2">Filter by Region Category</h3>
            <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto">
              {Object.keys(regionCategories).map(category => (
                <button
                  key={category}
                  onClick={() => handleCategorySelect(category)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? "bg-lol-blue text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          
          {selectedCategory !== "All" && (
            <div className="w-full md:w-auto">
              <h3 className="font-medium mb-2">Filter by {selectedCategory} Region</h3>
              <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto">
                {regionCategories[selectedCategory].map(region => (
                  <button
                    key={region}
                    onClick={() => handleRegionSelect(region)}
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
          )}
          
          {selectedRegion === "LTA" && (
            <div className="w-full md:w-auto">
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
