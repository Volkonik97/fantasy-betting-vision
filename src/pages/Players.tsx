
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import { Player } from "@/utils/models/types";
import { getTeams, clearTeamsCache } from "@/utils/database/teamsService";
import PlayerFilters from "@/components/players/PlayerFilters";
import PlayersList from "@/components/players/PlayersList";
import { normalizeRoleName } from "@/utils/leagueData/assembler/modelConverter";
import { toast } from "sonner";

const Players = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("All");
  const [selectedRegion, setSelectedRegion] = useState<string>("All");
  const [selectedSubRegion, setSelectedSubRegion] = useState<string>("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [allPlayers, setAllPlayers] = useState<(Player & { teamName: string; teamRegion: string })[]>([]);
  const [loading, setIsLoading] = useState(true);
  const [availableRegions, setAvailableRegions] = useState<string[]>([]);
  
  const roles = ["All", "Top", "Jungle", "Mid", "ADC", "Support"];
  
  // Updated region categories to ensure LCK is correctly categorized
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
        setIsLoading(true);
        
        // Force a fresh load of data
        clearTeamsCache();
        const teams = await getTeams();
        
        console.log(`Loaded ${teams.length} teams for Players page`);
        
        // Log all teams regions for debugging
        console.log("All team regions:", teams.map(team => team.region).sort());
        
        const playersWithTeamInfo: (Player & { teamName: string; teamRegion: string })[] = [];
        
        // Extract players from teams and add team information
        teams.forEach(team => {
          if (team.players && team.players.length > 0) {
            console.log(`Team ${team.name} (${team.region}) has ${team.players.length} players`);
            
            const teamPlayers = team.players.map(player => {
              // Always normalize role
              const normalizedRole = normalizeRoleName(player.role || 'Mid');
              
              return {
                ...player,
                role: normalizedRole,
                teamName: team.name,
                teamRegion: team.region
              };
            });
            
            playersWithTeamInfo.push(...teamPlayers);
          } else {
            console.warn(`No players found for team: ${team.name} (${team.region})`);
          }
        });
        
        console.log("Total players with team data:", playersWithTeamInfo.length);
        
        // Count players by region for debugging
        const playersByRegion = playersWithTeamInfo.reduce((acc, player) => {
          const region = player.teamRegion || 'Unknown';
          acc[region] = (acc[region] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        console.log("Players by region:", playersByRegion);
        
        // Check specifically for LCK players
        const lckPlayers = playersWithTeamInfo.filter(p => p.teamRegion === 'LCK');
        console.log(`Found ${lckPlayers.length} LCK players`);
        
        setAllPlayers(playersWithTeamInfo);
        
        const uniqueRegions = [...new Set(teams.map(team => team.region))].filter(Boolean);
        console.log("Available regions in database:", uniqueRegions);
        setAvailableRegions(uniqueRegions);
        
        if (playersWithTeamInfo.length === 0) {
          toast.warning("Aucun joueur trouvé dans la base de données");
        }
        
      } catch (error) {
        console.error("Error fetching player data:", error);
        toast.error("Erreur lors du chargement des données des joueurs");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    setSelectedSubRegion("All");
  }, [selectedRegion]);
  
  const filteredPlayers = allPlayers.filter(player => {
    // Make sure player.role exists and is properly normalized
    const normalizedPlayerRole = normalizeRoleName(player.role || 'Mid');
    
    // Match roles - use normalized roles for comparison
    const normalizedSelectedRole = selectedRole === "All" ? "All" : normalizeRoleName(selectedRole);
    const roleMatches = normalizedSelectedRole === "All" || normalizedPlayerRole === normalizedSelectedRole;
    
    // Handle region matching - improved logic for categories and specific regions
    let regionMatches = true;
    
    // If we select a category
    if (selectedCategory !== "All") {
      // If no specific region is selected within the category
      if (selectedRegion === "All") {
        // Filter by all regions in this category
        const regionsInCategory = regionCategories[selectedCategory] || [];
        regionMatches = regionsInCategory.includes("All") || regionsInCategory.includes(player.teamRegion);
      } else {
        // Specific region is selected
        regionMatches = player.teamRegion === selectedRegion;
      }
    } else if (selectedRegion !== "All") {
      // Direct region selection (not through category)
      regionMatches = player.teamRegion === selectedRegion;
    }
    
    // Special case for LTA subregions
    if (selectedRegion === "LTA") {
      if (selectedSubRegion === "All") {
        regionMatches = player.teamRegion.startsWith("LTA");
      } else {
        regionMatches = player.teamRegion === selectedSubRegion;
      }
    }
    
    // Handle search term matching
    const searchMatches = 
      player.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (player.teamName && player.teamName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return roleMatches && regionMatches && searchMatches;
  });
  
  // Log filtered players for debugging
  useEffect(() => {
    console.log(`Filtered players: ${filteredPlayers.length}`);
    
    // Count filtered players by role
    const filteredRoleCounts = filteredPlayers.reduce((acc, player) => {
      const normalizedRole = normalizeRoleName(player.role);
      acc[normalizedRole] = (acc[normalizedRole] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log("Filtered players by role:", filteredRoleCounts);
    
    // Count filtered players by region
    const filteredRegionCounts = filteredPlayers.reduce((acc, player) => {
      acc[player.teamRegion] = (acc[player.teamRegion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log("Filtered players by region:", filteredRegionCounts);
    
    // If LCK is involved, log more details
    if (selectedCategory === "Ligues Majeures" || selectedRegion === "LCK") {
      const lckPlayers = filteredPlayers.filter(p => p.teamRegion === "LCK");
      console.log(`Found ${lckPlayers.length} LCK players in filtered results`);
      if (lckPlayers.length > 0) {
        console.log("LCK teams represented:", [...new Set(lckPlayers.map(p => p.teamName))]);
      }
    }
  }, [filteredPlayers, selectedCategory, selectedRegion]);
  
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
        
        <PlayerFilters
          selectedRole={selectedRole}
          setSelectedRole={setSelectedRole}
          selectedCategory={selectedCategory}
          handleCategorySelect={setSelectedCategory}
          selectedRegion={selectedRegion}
          handleRegionSelect={setSelectedRegion}
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
