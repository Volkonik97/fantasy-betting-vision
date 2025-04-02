
import React, { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import { Player } from "@/utils/models/types";
import PlayerFilters from "@/components/players/PlayerFilters";
import PlayersList from "@/components/players/PlayersList";
import { toast } from "sonner";
import { getPlayers, clearPlayersCache, transformPlayersForList } from "@/utils/database/playersService";

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

  // Memoized filter function to improve performance
  const filterPlayers = useCallback((players: (Player & { teamName: string; teamRegion: string })[]) => {
    return players.filter(player => {
      if (!player || !player.name) {
        return false;
      }

      const normalizedPlayerRole = player.role?.toLowerCase() || '';
      const roleMatches = selectedRole === "All" || (
        normalizedPlayerRole && (
          normalizedPlayerRole === selectedRole.toLowerCase() ||
          (selectedRole === "ADC" && ["adc", "bot", "botlane"].includes(normalizedPlayerRole)) ||
          (selectedRole === "Support" && ["support", "sup", "supp"].includes(normalizedPlayerRole)) ||
          (selectedRole === "Jungle" && ["jungle", "jgl", "jg", "jungler"].includes(normalizedPlayerRole))
        )
      );
      
      let regionMatches = true;
      
      if (selectedCategory !== "All") {
        if (selectedRegion === "All") {
          regionMatches = regionCategories[selectedCategory].some(region => 
            region === "All" || (player.teamRegion && player.teamRegion === region)
          );
        } else {
          regionMatches = player.teamRegion === selectedRegion;
        }
      } else if (selectedRegion !== "All") {
        regionMatches = player.teamRegion === selectedRegion;
      }
      
      if (selectedRegion === "LTA") {
        if (selectedSubRegion === "All") {
          regionMatches = player.teamRegion && player.teamRegion.startsWith("LTA");
        } else {
          regionMatches = player.teamRegion === selectedSubRegion;
        }
      }
      
      const searchMatches = !searchTerm || (
        player.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (player.teamName && player.teamName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      
      const isHanwha = player.teamName?.includes("Hanwha") || 
                      player.team === "oe:team:3a1d18f46bcb3716ebcfcf4ef068934";
                      
      if (searchTerm && searchTerm.toLowerCase().includes("hanwha") && isHanwha) {
        return true;
      }
      
      return roleMatches && regionMatches && searchMatches;
    });
  }, [selectedRole, selectedCategory, selectedRegion, selectedSubRegion, searchTerm]);
  
  // Memoized filtered players
  const [filteredPlayers, setFilteredPlayers] = useState<(Player & { teamName: string; teamRegion: string })[]>([]);

  // Update filtered players when filter criteria or all players change
  useEffect(() => {
    setFilteredPlayers(filterPlayers(allPlayers));
  }, [allPlayers, filterPlayers]);
  
  useEffect(() => {
    const fetchPlayersData = async () => {
      try {
        setLoading(true);
        
        // Get all players from the improved service
        const players = await getPlayers(false); // Use cached data when available
        
        // Transform players to ensure they have required teamName and teamRegion properties
        const transformedPlayers = transformPlayersForList(players);
        
        const uniqueRegions = [...new Set(transformedPlayers
          .map(player => player.teamRegion)
          .filter(Boolean)
        )];
        
        setAllPlayers(transformedPlayers);
        setAvailableRegions(uniqueRegions);
      } catch (error) {
        console.error("Error fetching players data:", error);
        toast.error("Erreur lors du chargement des données des joueurs");
      } finally {
        setLoading(false);
      }
    };
    
    fetchPlayersData();
  }, []);

  useEffect(() => {
    setSelectedSubRegion("All");
  }, [selectedRegion]);
  
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
