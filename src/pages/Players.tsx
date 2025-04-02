
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import { Player } from "@/utils/models/types";
import { getTeams } from "@/utils/database/teamsService";
import PlayerFilters from "@/components/players/PlayerFilters";
import PlayersList from "@/components/players/PlayersList";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { normalizeRoleName } from "@/utils/leagueData/assembler/modelConverter";

interface DbPlayer {
  id: string;
  name: string;
  role: string | null;
  image: string | null;
  team_id: string | null;
  kda: number | null;
  cs_per_min: number | null;
  damage_share: number | null;
  champion_pool: string[] | null;
  teams?: {
    name: string;
    region: string;
  };
}

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
    const fetchPlayersData = async () => {
      try {
        setLoading(true);
        
        console.log("Fetching all players from database directly...");
        
        // Récupérer tous les joueurs directement de la base de données
        const { data: playersData, error: playersError } = await supabase
          .from('players')
          .select('*, teams:team_id(name, region)');
          
        if (playersError) {
          console.error("Error fetching players data:", playersError);
          throw playersError;
        }
        
        if (!playersData || playersData.length === 0) {
          console.log("No players found in direct database query, falling back to teams approach");
          await fetchPlayersFromTeams();
          return;
        }
        
        const validPlayers = playersData.filter((player: DbPlayer) => 
          player && player.id && player.name
        );
        
        console.log(`Direct query found ${validPlayers.length} valid players out of ${playersData.length} total`);
        
        // Add special check for Hanwha Life
        const hanwhaPlayers = validPlayers.filter((p: DbPlayer) => 
          p.team_id === "oe:team:3a1d18f46bcb3716ebcfcf4ef068934" ||
          (p.teams?.name && p.teams.name.includes("Hanwha"))
        );
        
        console.log(`Found ${hanwhaPlayers.length} Hanwha Life Esports players:`, hanwhaPlayers);
        
        const mappedPlayers = validPlayers.map((player: DbPlayer) => ({
          id: player.id,
          name: player.name,
          role: normalizeRoleName(player.role || "Unknown"),
          image: player.image || "",
          team: player.team_id || "",
          teamName: player.teams?.name || "Unknown team",
          teamRegion: player.teams?.region || "Unknown region",
          kda: typeof player.kda === 'number' ? player.kda : 0,
          csPerMin: typeof player.cs_per_min === 'number' ? player.cs_per_min : 0,
          damageShare: typeof player.damage_share === 'number' ? player.damage_share : 0,
          championPool: Array.isArray(player.champion_pool) 
            ? player.champion_pool 
            : typeof player.champion_pool === 'string'
              ? player.champion_pool.split(',').map(c => c.trim())
              : []
        }));
        
        // Collect unique regions
        const uniqueRegions = [...new Set(mappedPlayers
          .map(player => player.teamRegion)
          .filter(Boolean)
        )];
        
        setAllPlayers(mappedPlayers);
        setAvailableRegions(uniqueRegions);
        
      } catch (error) {
        console.error("Error in direct players fetch:", error);
        // Fallback to the previous approach
        await fetchPlayersFromTeams();
      } finally {
        setLoading(false);
      }
    };
    
    const fetchPlayersFromTeams = async () => {
      try {
        setLoading(true);
        const teams = await getTeams();
        
        // Ensure all teams have players array
        const teamsWithPlayers = teams.map(team => ({
          ...team,
          players: team.players || []
        }));
        
        // Flatten and map players with team data
        const players = teamsWithPlayers.flatMap(team => 
          team.players.map(player => ({
            ...player,
            teamName: team.name,
            teamRegion: team.region
          }))
        );
        
        // Filter out players without required fields
        const validPlayers = players.filter(player => 
          player.id && 
          player.name && 
          player.role
        );
        
        console.log(`Loaded ${validPlayers.length} valid players out of ${players.length} total via teams`);
        
        if (validPlayers.length === 0 && players.length > 0) {
          console.warn("No valid players found after filtering. Check player data structure.");
          console.log("Sample player data:", players[0]);
        }
        
        // Set player data with proper defaults for missing values
        const processedPlayers = validPlayers.map(player => ({
          ...player,
          kda: typeof player.kda === 'number' ? player.kda : 0,
          csPerMin: typeof player.csPerMin === 'number' ? player.csPerMin : 0,
          damageShare: typeof player.damageShare === 'number' ? player.damageShare : 0,
          championPool: Array.isArray(player.championPool) 
            ? player.championPool 
            : typeof player.championPool === 'string'
              ? player.championPool.split(',').map((c: string) => c.trim())
              : []
        }));
        
        setAllPlayers(processedPlayers);
        
        // Get unique regions
        const uniqueRegions = [...new Set(teamsWithPlayers
          .map(team => team.region)
          .filter(Boolean)
        )];
        
        console.log("Available regions in database:", uniqueRegions);
        setAvailableRegions(uniqueRegions);
        
      } catch (error) {
        console.error("Error fetching player data:", error);
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
  
  const filteredPlayers = allPlayers.filter(player => {
    // Normalize and improve role matching
    const normalizedPlayerRole = player.role?.toLowerCase() || '';
    const roleMatches = selectedRole === "All" || (
      normalizedPlayerRole && (
        normalizedPlayerRole === selectedRole.toLowerCase() ||
        (selectedRole === "ADC" && ["adc", "bot", "botlane"].includes(normalizedPlayerRole)) ||
        (selectedRole === "Support" && ["support", "sup", "supp"].includes(normalizedPlayerRole)) ||
        (selectedRole === "Jungle" && ["jungle", "jgl", "jg", "jungler"].includes(normalizedPlayerRole))
      )
    );
    
    // Region filtering logic
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
    
    // Handle LTA subregions
    if (selectedRegion === "LTA") {
      if (selectedSubRegion === "All") {
        regionMatches = player.teamRegion && player.teamRegion.startsWith("LTA");
      } else {
        regionMatches = player.teamRegion === selectedSubRegion;
      }
    }
    
    // Name and team search
    const searchMatches = !searchTerm || (
      player.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (player.teamName && player.teamName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    // Special case pour Hanwha Life Esports
    const isHanwha = player.teamName?.includes("Hanwha") || 
                    player.team === "oe:team:3a1d18f46bcb3716ebcfcf4ef068934";
                    
    if (searchTerm && searchTerm.toLowerCase().includes("hanwha") && isHanwha) {
      return true;
    }
    
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
