
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import { Player } from "@/utils/models/types";
import { getTeams } from "@/utils/database/teamsService";
import PlayerFilters from "@/components/players/PlayerFilters";
import PlayersList from "@/components/players/PlayersList";

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
  
  const regionCategories = {
    "All": ["All"],
    "Ligues Majeures": ["LCK", "LPL", "LTA N", "LEC"],
    "ERL": ["LFL", "PRM", "LVP SL", "NLC", "LIT", "AL", "TCL", "RL", "HLL", "LPLOL", "HW", "EBL", "ROL"],
    "Division 2": ["LCKC", "LFL2", "LRS", "LRN", "NEXO", "CD"],
    "Autres": ["LCP", "LJL", "LTA N", "PCS", "VCS"]
  };
  
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
        console.log("Players in AL region:", players.filter(player => player.teamRegion === "AL").length);
        setAllPlayers(players);
        
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

  useEffect(() => {
    setSelectedSubRegion("All");
  }, [selectedRegion]);
  
  const filteredPlayers = allPlayers.filter(player => {
    const roleMatches = selectedRole === "All" || 
      player.role.toLowerCase() === selectedRole.toLowerCase();
    
    let regionMatches = true;
    
    if (selectedCategory !== "All") {
      if (selectedRegion === "All") {
        // If a category is selected but no specific region, show all players in that category
        regionMatches = regionCategories[selectedCategory].some(region => 
          region === "All" || player.teamRegion === region
        );
      } else {
        // If both category and region are selected, show only players in that specific region
        regionMatches = player.teamRegion === selectedRegion;
      }
    } else if (selectedRegion !== "All") {
      // If only a region is selected (no category), show players in that region
      regionMatches = player.teamRegion === selectedRegion;
    }
    
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
    setSelectedRegion("All");
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
        
        <PlayerFilters
          selectedRole={selectedRole}
          setSelectedRole={setSelectedRole}
          selectedCategory={selectedCategory}
          handleCategorySelect={handleCategorySelect}
          selectedRegion={selectedRegion}
          handleRegionSelect={handleRegionSelect}
          selectedSubRegion={selectedSubRegion}
          setSelectedSubRegion={setSelectedSubRegion}
          roles={roles}
          regionCategories={regionCategories}
          subRegions={subRegions}
        />
        
        <PlayersList 
          players={filteredPlayers}
          loading={loading}
        />
      </main>
    </div>
  );
};

export default Players;
