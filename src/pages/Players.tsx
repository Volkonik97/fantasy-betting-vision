
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import { Player } from "@/utils/models/types";
import PlayerFilters from "@/components/players/PlayerFilters";
import PlayersList from "@/components/players/PlayersList";
import { getAllPlayers } from "@/services/playerService";
import { getAllTeams } from "@/services/teamService";
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

  const regionCategories = {
    All: ["All"],
    "Ligues Majeures": ["LCK", "LPL", "LTA N", "LEC"],
    ERL: ["LFL", "PRM", "LVP SL", "NLC", "LIT", "AL", "TCL", "RL", "HLL", "LPLOL", "HW", "EBL", "ROL"],
    "Division 2": ["LCKC", "LFL2", "LRS", "LRN", "NEXO", "CD"],
    Autres: ["LCP", "LJL", "LTA N", "PCS", "VCS"]
  };

  const subRegions = {
    LTA: ["All", "LTA N", "LTA S"]
  };

  useEffect(() => {
    loadPlayersData();
  }, []);

  useEffect(() => {
    setSelectedSubRegion("All");
  }, [selectedRegion]);

  const loadPlayersData = async () => {
    try {
      setIsLoading(true);
      
      // Load players and teams in parallel for efficiency
      const [playersData, teamsData] = await Promise.all([
        getAllPlayers(),
        getAllTeams()
      ]);
      
      console.log(`Loaded ${playersData.length} players and ${teamsData.length} teams`);
      
      if (playersData.length === 0) {
        toast.error("Aucun joueur trouvé dans la base de données");
        setIsLoading(false);
        return;
      }
      
      // Create a map of team IDs to team details for quick lookup
      const teamsMap = new Map(teamsData.map(team => [team.id, team]));
      
      // Enrich players with team information
      const enrichedPlayers = playersData.map(player => {
        const team = teamsMap.get(player.team);
        return {
          ...player,
          teamName: team?.name || "Équipe inconnue",
          teamRegion: team?.region || "Région inconnue"
        };
      });
      
      console.log(`Processed ${enrichedPlayers.length} enriched players`);
      setAllPlayers(enrichedPlayers);
      
      // Extract unique regions for filters
      const uniqueRegions = [...new Set(teamsData.map(team => team.region).filter(Boolean))];
      setAvailableRegions(uniqueRegions);
      
    } catch (error) {
      console.error("Error loading players data:", error);
      toast.error("Erreur lors du chargement des données des joueurs");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPlayers = allPlayers.filter(player => {
    const searchTermLower = searchTerm.toLowerCase();
    const playerNameLower = player.name.toLowerCase();
    const teamNameLower = player.teamName.toLowerCase();

    const searchMatch = playerNameLower.includes(searchTermLower) || teamNameLower.includes(searchTermLower);
    const roleMatch = selectedRole === "All" || player.role === selectedRole;
    const regionMatch = selectedRegion === "All" || player.teamRegion === selectedRegion;
    const subRegionMatch = selectedSubRegion === "All" || (subRegions[selectedRegion]?.includes(selectedSubRegion) && player.teamRegion === selectedSubRegion);
    const categoryMatch = selectedCategory === "All" || regionCategories[selectedCategory]?.includes(player.teamRegion);

    return searchMatch && roleMatch && regionMatch && (selectedRegion in subRegions ? subRegionMatch : categoryMatch);
  });

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Players</h1>
          <p className="text-gray-600">Browse and analyze professional League of Legends players</p>
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

        <PlayersList players={filteredPlayers} loading={loading} />
      </main>
    </div>
  );
};

export default Players;
