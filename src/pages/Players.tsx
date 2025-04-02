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

  const fetchPlayers = async () => {
    try {
      setIsLoading(true);

      const teams = await getTeams();
      console.log(`✅ ${teams.length} équipes chargées.`);

      const playersWithTeamInfo: (Player & { teamName: string; teamRegion: string })[] = [];

      teams.forEach((team, teamIndex) => {
        if (!Array.isArray(team.players) || team.players.length === 0) return;

        team.players.forEach((player, playerIndex) => {
          console.warn(`🧩 Tentative d'ajout du joueur ${player.name} (${player.id}) dans ${team.name}`);
          if (!player.id || !player.name) {
  console.warn(`🧩 Tentative d'ajout du joueur ${player.name} (${player.id}) dans ${team.name}`);
  console.warn(`⚠️ Joueur sans ID ou nom dans l'équipe ${team.name}`);
  console.warn("Joueur exclu :", player);
  return;
}


          playersWithTeamInfo.push({
            ...player,
            teamName: team.name || "Unknown",
            teamRegion: team.region || "Unknown"
          });
        });
      });

console.warn(`✅ Total joueurs enrichis ajoutés : ${playersWithTeamInfo.length}`);


      // 🧾 Log tous les joueurs collectés avant filtrage
      console.log("🧾 Liste brute des joueurs récupérés :");
      playersWithTeamInfo.forEach(p => {
        console.log(`- ${p.name} (${p.teamName}) — region: ${p.teamRegion} — id: ${p.id}`);
      });

      // 🔍 Dump ciblé pour l'équipe Gen.G
      const debugTeam = teams.find(t => t.name.trim().toLowerCase() === "gen.g");
      if (debugTeam) {
        console.log("🔎 Équipe ciblée : Gen.G");
        console.log(JSON.stringify(debugTeam, null, 2));
      } else {
        console.warn("❌ Aucune équipe Gen.G trouvée dans getTeams()");
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
  console.warn("🔎 Tous les joueurs bruts (allPlayers):", allPlayers.map(p => p.name));

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

    console.warn("🔍 Joueurs filtrés (filteredPlayers):", filteredPlayers.map(p => p.name));

    const searchMatches =
      player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (player.teamName && player.teamName.toLowerCase().includes(searchTerm.toLowerCase()));

    console.log("🧪 Filter debug →", {
      name: player.name,
      role: player.role,
      teamRegion: player.teamRegion,
      selectedCategory,
      selectedRegion,
      selectedSubRegion,
      searchTerm,
      regionMatches,
      roleMatches,
      searchMatches,
      included: roleMatches && regionMatches && searchMatches
    });

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
