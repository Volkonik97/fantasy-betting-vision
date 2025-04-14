
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import { Player } from "@/utils/models/types";
import { getTeams, clearTeamsCache } from "@/utils/database/teamsService";
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
    fetchPlayers();
  }, []);

  useEffect(() => {
    setSelectedSubRegion("All");
  }, [selectedRegion]);

  const fetchPlayers = async () => {
    try {
      setIsLoading(true);
      
      // Vider le cache pour éviter d'avoir des données périmées
      clearTeamsCache();
      console.log("Fetching teams from Supabase...");
      const teams = await getTeams();
      console.log(`Received ${teams.length} teams from database`);
      
      // Log des équipes pour débogage
      if (teams.length === 0) {
        toast.warning("Aucune équipe trouvée dans la base de données");
        setIsLoading(false);
        return;
      }
      
      console.log("Team regions:", teams.map(t => t.region).filter(Boolean));
      
      // Préparer un tableau pour stocker tous les joueurs avec leurs infos d'équipe
      const playersWithTeamInfo: (Player & { teamName: string; teamRegion: string })[] = [];

      // Traiter chaque équipe pour extraire ses joueurs
      teams.forEach(team => {
        if (!team.players || !Array.isArray(team.players) || team.players.length === 0) {
          console.log(`L'équipe ${team.name} n'a pas de joueurs ou un format invalide`);
          return;
        }

        console.log(`Traitement de l'équipe ${team.name} avec ${team.players.length} joueurs`);

        // Ajouter chaque joueur au tableau avec les infos de son équipe
        team.players.forEach(player => {
          if (!player.id || !player.name) {
            console.warn(`⚠️ Joueur ignoré dans ${team.name} car données incomplètes:`, player);
            return;
          }

          playersWithTeamInfo.push({
            ...player,
            teamName: team.name || "Équipe inconnue",
            teamRegion: team.region || "Région inconnue",
          });
        });
      });

      console.log(`Total de ${playersWithTeamInfo.length} joueurs traités`);
      setAllPlayers(playersWithTeamInfo);
      
      // Extraire les régions uniques pour les filtres
      const uniqueRegions = [...new Set(teams.map(team => team.region).filter(Boolean))];
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
