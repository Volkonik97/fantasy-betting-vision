// 🔧 Forcer tous les logs à apparaître dans la console (niveau warning)
console.log = (...args) => console.warn(...args);

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import { Player } from "@/utils/models/types";
import { getTeams } from "@/utils/database/teamsService";
import PlayerFilters from "@/components/players/PlayerFilters";
import PlayersList from "@/components/players/PlayersList";
import { toast } from "sonner";

const Players = () => {
  console.warn("📦 Composant Players monté");
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
    console.warn("🚀 fetchPlayers() appelée !");
    try {
      setIsLoading(true);

      const teams = await getTeams();
      console.warn(`✅ ${teams.length} équipes chargées.`);

      // 🔍 Liste de toutes les équipes récupérées
      console.warn("📋 Liste de toutes les équipes récupérées :");
      teams.forEach(t => {
        console.warn(`- ${t.name} (${t.region}) - ${t.players?.length || 0} joueurs`);
      });

      const playersWithTeamInfo: (Player & { teamName: string; teamRegion: string })[] = [];

      teams.forEach((team, teamIndex) => {
        if (!Array.isArray(team.players)) {
          console.warn(`⚠️ L'équipe ${team.name} n'a pas de tableau de joueurs valide`);
          return;
        }
        
        if (team.players.length === 0) {
          console.warn(`⚠️ L'équipe ${team.name} (${team.region}) n'a aucun joueur`);
          return;
        }

        team.players.forEach((player, playerIndex) => {
          if (!player.id || !player.name) {
            console.warn(`⚠️ Joueur sans ID ou nom dans l'équipe ${team.name}`);
            return;
          }

          // Vérifier que le joueur a toutes les propriétés nécessaires
          const enrichedPlayer = {
            ...player,
            teamName: team.name || "Unknown",
            teamRegion: team.region || "Unknown",
            // S'assurer que ces propriétés existent toujours
            role: player.role || "Unknown",
            kda: player.kda || 0,
            csPerMin: player.csPerMin || 0,
            damageShare: player.damageShare || 0
          };

          playersWithTeamInfo.push(enrichedPlayer);
        });
      });

      // 🧾 Log tous les joueurs collectés avant filtrage
      console.warn(`🧾 Liste brute des joueurs récupérés: ${playersWithTeamInfo.length} joueurs au total`);
      
      // Group by region for more concise logging
      const playersByRegion = playersWithTeamInfo.reduce((acc, p) => {
        const region = p.teamRegion || "Unknown";
        if (!acc[region]) acc[region] = [];
        acc[region].push(p);
        return acc;
      }, {} as Record<string, any[]>);
      
      Object.entries(playersByRegion).forEach(([region, players]) => {
        console.warn(`- Région ${region}: ${players.length} joueurs`);
        players.slice(0, 3).forEach(p => {
          console.warn(`  - ${p.name} (${p.role}) - Équipe: ${p.teamName}`);
        });
        if (players.length > 3) {
          console.warn(`  - ... et ${players.length - 3} autres joueurs`);
        }
      });

      setAllPlayers(playersWithTeamInfo);

      const uniqueRegions = [...new Set(teams.map(team => team.region))].filter(Boolean);
      setAvailableRegions(uniqueRegions);

      if (playersWithTeamInfo.length === 0) {
        toast.warning("Aucun joueur trouvé dans la base de données");
      } else {
        console.warn(`✅ ${playersWithTeamInfo.length} joueurs chargés avec succès!`);
      }
    } catch (error) {
      console.error("❌ Erreur lors du chargement des données :", error);
      toast.error("Erreur lors du chargement des données des joueurs");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPlayers = allPlayers.filter(player => {
    // Vérifier si le joueur a toutes les propriétés nécessaires
    if (!player.name || !player.role || !player.teamName || !player.teamRegion) {
      console.warn(`🚫 Joueur incomplet ignoré dans le filtrage: ${player.name || "Sans nom"}`);
      return false;
    }
    
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

    const included = roleMatches && regionMatches && searchMatches;
    
    // Réduire le nombre de logs pour éviter d'encombrer la console
    if (!included && (!player.role || !player.teamRegion)) {
      console.warn("🧪 Filter debug →", {
        name: player.name,
        role: player.role,
        teamRegion: player.teamRegion,
        teamName: player.teamName,
        selectedCategory,
        selectedRegion,
        selectedSubRegion,
        searchTerm,
        regionMatches,
        roleMatches,
        searchMatches,
        included
      });
    }

    return included;
  });

  // Log des statistiques de filtrage
  useEffect(() => {
    console.warn(`📊 Filtrage: ${allPlayers.length} joueurs au total → ${filteredPlayers.length} après filtrage`);
    
    if (filteredPlayers.length > 0) {
      // Grouper par équipe pour voir la distribution
      const teamCounts = filteredPlayers.reduce((acc, player) => {
        const teamName = player.teamName || 'Unknown';
        acc[teamName] = (acc[teamName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      console.warn("📋 Joueurs filtrés par équipe:", teamCounts);
      
      // Grouper par rôle pour vérifier la distribution
      const roleCounts = filteredPlayers.reduce((acc, player) => {
        const role = player.role || 'Unknown';
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      console.warn("📋 Joueurs filtrés par rôle:", roleCounts);
    }
  }, [filteredPlayers.length]);

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