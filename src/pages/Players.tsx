
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import { Player, PlayerRole } from "@/utils/models/types";
import { getTeams } from "@/utils/database/teamsService";
import PlayerFilters from "@/components/players/PlayerFilters";
import PlayersList from "@/components/players/PlayersList";
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
  
  // Region categories with consistent naming
  const regionCategories = {
    "All": ["All"],
    "Ligues Majeures": ["LCK", "LPL", "LTA N", "LEC"],
    "ERL": ["LFL", "PRM", "LVP SL", "NLC", "LIT", "AL", "TCL", "RL", "HLL", "LPLOL", "HW", "EBL", "ROL"],
    "Division 2": ["LCKC", "LFL2", "LRS", "LRN", "NEXO", "CD"],
    "Autres": ["LCP", "LJL", "LTA N", "PCS", "VCS"]
  };
  
  const subRegions = {
    LTA: ["All", "LTA N", "LTA S"]
  };
  
  // Load data on component mount
  useEffect(() => {
    fetchPlayers();
  }, []);
  
  // Reset subregion when region changes
  useEffect(() => {
    setSelectedSubRegion("All");
  }, [selectedRegion]);
  
  const fetchPlayers = async () => {
  try {
    setIsLoading(true);

    const teams = await getTeams();
    // 🧪 Filtrer une équipe spécifique pour debug
    const rawTeam = teams.find(t => t.name.includes("Gen"));
    console.log("📌 Dump ciblé de l'équipe :", rawTeam);

    // Et si tu veux voir ses joueurs
    console.log("📋 Joueurs dans cette équipe :", rawTeam?.players?.map(p => p.name));



    const playersWithTeamInfo: (Player & { teamName: string; teamRegion: string })[] = [];

    teams.forEach((team, teamIndex) => {
      console.log(`\n🔹 Équipe ${teamIndex + 1}: ${team.name} (${team.region})`);

      if (!Array.isArray(team.players) || team.players.length === 0) {
        console.warn(`⛔ Aucune liste de joueurs pour l'équipe "${team.name}"`);
        return;
      }

      team.players.forEach((player, playerIndex) => {
        const hasId = Boolean(player.id);
        const hasName = Boolean(player.name);

        if (!hasId || !hasName) {
          console.warn(`⚠️ Joueur invalide ignoré [${team.name}] :`, player);
          return;
        }

        playersWithTeamInfo.push({
          ...player,
          teamName: team.name || "Unknown",
          teamRegion: team.region || "Unknown"
        });

        console.log(`✅ Joueur ajouté : ${player.name} (${player.role || "no role"})`);
      });
    });

    console.log(`\n📦 Nombre total de joueurs collectés : ${playersWithTeamInfo.length}`);
    const missing = playersWithTeamInfo.filter(p => !p.id || !p.name);
    if (missing.length > 0) {
      console.warn("🚨 Joueurs invalides présents dans la liste finale :", missing);
    }

    setAllPlayers(playersWithTeamInfo);

    const uniqueRegions = [...new Set(teams.map(team => team.region))].filter(Boolean);
    setAvailableRegions(uniqueRegions);

    if (playersWithTeamInfo.length === 0) {
      toast.warning("Aucun joueur trouvé dans la base de données");
    }
  } catch (error) {
    console.error("❌ Erreur lors du chargement des données :", error);
    toast.error("Erreur lors du chargement des données des joueurs");
  } finally {
    setIsLoading(false);
  }
};


  // Filter players based on selected filters
  const filteredPlayers = allPlayers.filter(player => {
    // Match roles
    const roleMatches = selectedRole === "All" || player.role === selectedRole;
    
    // Match regions based on selection
    let regionMatches = true;
    
    // Category filtering
    if (selectedCategory !== "All") {
      // If category is selected but no specific region
      if (selectedRegion === "All") {
        const regionsInCategory = regionCategories[selectedCategory] || [];
        regionMatches = regionsInCategory.includes("All") || regionsInCategory.includes(player.teamRegion);
      } else {
        // Specific region selected
        regionMatches = player.teamRegion === selectedRegion;
      }
    } else if (selectedRegion !== "All") {
      // Direct region selection
      regionMatches = player.teamRegion === selectedRegion;
    }
    
    // Special case for LTA subregions
    if (selectedRegion === "LTA") {
      if (selectedSubRegion === "All") {
        regionMatches = player.teamRegion?.startsWith("LTA") || false;
      } else {
        regionMatches = player.teamRegion === selectedSubRegion;
      }
    }
    
    // Search term matching
    const searchMatches = 
      player.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (player.teamName && player.teamName.toLowerCase().includes(searchTerm.toLowerCase()));
    
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
