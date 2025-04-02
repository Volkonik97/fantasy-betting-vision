
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import { Player } from "@/utils/models/types";
import { getTeams } from "@/utils/database/teamsService";
import PlayerFilters from "@/components/players/PlayerFilters";
import PlayersList from "@/components/players/PlayersList";
import { normalizeRoleName } from "@/utils/leagueData/assembler/modelConverter";

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
          team.players.map(player => {
            // Log players with unusual roles to help debug
            if (player.role && !['Top', 'Jungle', 'Mid', 'ADC', 'Support'].includes(player.role)) {
              console.log(`Player with non-standard role: ${player.name}, Team: ${team.name}, Role: ${player.role}`);
            }
            
            // Check for Hanwha Life Esport players specifically
            if (team.name.includes('Hanwha') || team.region === 'HW') {
              console.log(`Hanwha player found: ${player.name}, Role: ${player.role}, Normalized: ${normalizeRoleName(player.role)}`);
            }
            
            return {
              ...player,
              teamName: team.name,
              teamRegion: team.region
            };
          })
        );
        
        console.log("Players with team data:", players.length);
        console.log("Teams by region:", teams.reduce((acc, team) => {
          acc[team.region] = (acc[team.region] || 0) + 1;
          return acc;
        }, {} as Record<string, number>));
        
        const roleDistribution = players.reduce((acc, player) => {
          const normalizedRole = normalizeRoleName(player.role);
          acc[normalizedRole] = (acc[normalizedRole] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        console.log("Role distribution:", roleDistribution);
        
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
    // Normalize player role for consistent comparison
    const normalizedPlayerRole = player.role ? normalizeRoleName(player.role) : "";
    const normalizedSelectedRole = selectedRole === "All" ? "All" : normalizeRoleName(selectedRole);
    
    // Match roles using normalized values
    const roleMatches = normalizedSelectedRole === "All" || normalizedPlayerRole === normalizedSelectedRole;
    
    let regionMatches = true;
    
    if (selectedCategory !== "All") {
      if (selectedRegion === "All") {
        regionMatches = regionCategories[selectedCategory].some(region => 
          region === "All" || player.teamRegion === region
        );
      } else {
        regionMatches = player.teamRegion === selectedRegion;
      }
    } else if (selectedRegion !== "All") {
      regionMatches = player.teamRegion === selectedRegion;
    }
    
    if (selectedRegion === "LTA") {
      if (selectedSubRegion === "All") {
        regionMatches = player.teamRegion.startsWith("LTA");
      } else {
        regionMatches = player.teamRegion === selectedSubRegion;
      }
    }
    
    // Check for HW region specifically to debug Hanwha Life issues
    if (player.teamRegion === 'HW' && !regionMatches) {
      console.log(`Hanwha player filtered out: ${player.name}, Category: ${selectedCategory}, Region: ${selectedRegion}`);
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
    
    // Check if this category includes the HW region for Hanwha Life
    if (category !== "All") {
      const includesHW = regionCategories[category].includes("HW");
      console.log(`Category ${category} includes HW region: ${includesHW}`);
    }
  };

  const handleRegionSelect = (region: string) => {
    setSelectedRegion(region);
    
    if (region === "HW") {
      console.log("HW region selected");
      console.log("Players in HW region:", allPlayers.filter(p => p.teamRegion === "HW").length);
      console.log("HW players sample:", allPlayers.filter(p => p.teamRegion === "HW").map(p => ({
        name: p.name,
        role: p.role,
        normalizedRole: normalizeRoleName(p.role)
      })));
    }
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
