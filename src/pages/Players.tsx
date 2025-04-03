import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import { Player } from "@/utils/models/types";
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

  const playersPerPage = 100;
  const [currentPage, setCurrentPage] = useState(1);

  const roles = ["All", "Top", "Jungle", "Mid", "ADC", "Support"];

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

  useEffect(() => {
    fetchPlayers();
  }, []);

  useEffect(() => {
    setSelectedSubRegion("All");
  }, [selectedRegion]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedRole, selectedRegion, selectedSubRegion, selectedCategory]);

  const fetchPlayers = async () => {
    try {
      setIsLoading(true);

      const teams = await getTeams();
      console.log(`✅ ${teams.length} équipes chargées.`);

      const playersWithTeamInfo: (Player & { teamName: string; teamRegion: string })[] = [];

      teams.forEach(team => {
        team.players?.forEach(player => {
          playersWithTeamInfo.push({
            ...player,
            teamName: player.teamName || team.name || "Unknown",
            teamRegion: player.teamRegion || team.region || "Unknown",
          });
        });
      });

      console.log("📦 [Players.tsx] Nombre total de joueurs injectés :", playersWithTeamInfo.length);

      const dbPlayerIds = new Set(playersWithTeamInfo.map(p => p.id));
      const allTeamPlayers = teams.flatMap(team => team.players || []);
      const missingPlayersFromTeams = allTeamPlayers.filter(p => !dbPlayerIds.has(p.id));

      if (missingPlayersFromTeams.length > 0) {
        console.warn(`🧩 ${missingPlayersFromTeams.length} joueur(s) manquant(s) trouvés dans teams[].players[] et injectés dans Players :`);
        missingPlayersFromTeams.forEach(p => {
          console.log(`→ ${p.name} (${p.teamName})`);
          playersWithTeamInfo.push(p);
        });
      } else {
        console.log("✅ Aucun joueur fantôme détecté ou à injecter.");
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

  const filteredPlayers = allPlayers.filter(player => {
    const roleMatches = selectedRole === "All" || player.role === selectedRole;

    let regionMatches = true;

    if (selectedCategory !== "All") {
      if (selectedRegion === "All") {
        const regionsInCategory = regionCategories[selectedCategory] || [];
        regionMatches = regionsInCategory.includes("All") || regionsInCategory.includes(player.teamRegion);
      } else {
        regionMatches = player.teamRegion === selectedRegion;
      }
    } else if (selectedRegion !== "All") {
      regionMatches = player.teamRegion === selectedRegion;
    }

    if (selectedRegion === "LTA") {
      if (selectedSubRegion === "All") {
        regionMatches = player.teamRegion?.startsWith("LTA") || false;
      } else {
        regionMatches = player.teamRegion === selectedSubRegion;
      }
    }

    const searchMatches =
      player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (player.teamName && player.teamName.toLowerCase().includes(searchTerm.toLowerCase()));

    return roleMatches && regionMatches && searchMatches;
  });

  const paginatedPlayers = filteredPlayers.slice(
    (currentPage - 1) * playersPerPage,
    currentPage * playersPerPage
  );

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

        <PlayersList players={paginatedPlayers} loading={loading} />

        {/* Pagination Controls */}
        <div className="flex justify-center items-center mt-6 gap-4">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            ◀ Page précédente
          </button>

          <span className="text-sm text-gray-700">
            Page {currentPage} sur {Math.ceil(filteredPlayers.length / playersPerPage)}
          </span>

          <button
            onClick={() => setCurrentPage(p => p + 1)}
            disabled={currentPage * playersPerPage >= filteredPlayers.length}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Page suivante ▶
          </button>
        </div>
      </main>
    </div>
  );
};

export default Players;
