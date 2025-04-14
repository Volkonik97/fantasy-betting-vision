
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import { Player, PlayerRole } from "@/utils/models/types";
import { getTeams, clearTeamsCache } from "@/utils/database/teamsService";
import PlayerFilters from "@/components/players/PlayerFilters";
import PlayersList from "@/components/players/PlayersList";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
    fetchPlayersData();
  }, []);

  useEffect(() => {
    setSelectedSubRegion("All");
  }, [selectedRegion]);

  const mapStringToPlayerRole = (roleStr: string): PlayerRole => {
    switch (roleStr) {
      case "Top": return "Top";
      case "Jungle": return "Jungle";
      case "Mid": return "Mid";
      case "ADC": return "ADC";
      case "Support": return "Support";
      default: return "Unknown";
    }
  };

  const fetchPlayersData = async () => {
    try {
      setIsLoading(true);
      
      // Récupérer directement les joueurs depuis la table players de Supabase
      console.log("Chargement des joueurs depuis la table players de Supabase...");
      
      const { data: playersData, error: playersError } = await supabase
        .from('players')
        .select('*');
      
      if (playersError) {
        console.error("Erreur lors du chargement des joueurs:", playersError);
        toast.error("Erreur lors du chargement des joueurs");
        setIsLoading(false);
        return;
      }
      
      console.log(`Nombre de joueurs récupérés: ${playersData?.length || 0}`);
      
      // Récupérer les équipes pour enrichir les données des joueurs
      clearTeamsCache();
      const teams = await getTeams();
      console.log(`Nombre d'équipes récupérées pour enrichir les données: ${teams.length}`);
      
      if (playersData && playersData.length > 0) {
        // Mapper les données des joueurs avec les informations d'équipe
        const enrichedPlayers = playersData.map(player => {
          const team = teams.find(t => t.id === player.teamid);
          return {
            id: player.playerid || "",
            name: player.playername || "",
            role: mapStringToPlayerRole(player.position || ""),
            image: player.image || "",
            team: player.teamid || "",
            teamName: team?.name || "Équipe inconnue",
            teamRegion: team?.region || "Région inconnue",
            kda: player.kda || 0,
            csPerMin: player.cspm || 0,
            damageShare: player.damage_share || 0,
            championPool: String(player.champion_pool || 0),
            avg_kills: player.avg_kills || 0,
            avg_deaths: player.avg_deaths || 0,
            avg_assists: player.avg_assists || 0,
            cspm: player.cspm || 0,
            dpm: player.dpm || 0,
            vspm: player.vspm || 0,
            wcpm: player.wcpm || 0,
            earned_gpm: player.earned_gpm || 0,
            earned_gold_share: player.earned_gold_share || 0,
            avg_golddiffat15: player.avg_golddiffat15 || 0,
            avg_xpdiffat15: player.avg_xpdiffat15 || 0,
            avg_csdiffat15: player.avg_csdiffat15 || 0,
            avg_firstblood_kill: player.avg_firstblood_kill || 0,
            avg_firstblood_assist: player.avg_firstblood_assist || 0,
            avg_firstblood_victim: player.avg_firstblood_victim || 0
          } as Player & { teamName: string; teamRegion: string };
        });
        
        setAllPlayers(enrichedPlayers);
        
        // Extraire les régions uniques pour les filtres
        const uniqueRegions = [...new Set(teams.map(team => team.region).filter(Boolean))];
        setAvailableRegions(uniqueRegions);
        
        console.log(`Traitement terminé: ${enrichedPlayers.length} joueurs chargés`);
      } else {
        console.log("Aucun joueur trouvé dans la table players, essai via les équipes...");
        await fetchPlayersViaTeams();
      }
    } catch (error) {
      console.error("❌ Erreur lors du chargement des données :", error);
      toast.error("Erreur lors du chargement des données des joueurs");
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchPlayersViaTeams = async () => {
    try {
      // Vider le cache pour éviter d'avoir des données périmées
      clearTeamsCache();
      console.log("Chargement des équipes depuis Supabase...");
      const teams = await getTeams();
      console.log(`${teams.length} équipes récupérées`);
      
      if (teams.length === 0) {
        toast.warning("Aucune équipe trouvée dans la base de données");
        return;
      }
      
      console.log("Régions des équipes:", teams.map(t => t.region).filter(Boolean));
      
      // Préparer un tableau pour stocker tous les joueurs avec leurs infos d'équipe
      const playersWithTeamInfo: (Player & { teamName: string; teamRegion: string })[] = [];

      // Traiter chaque équipe pour extraire ses joueurs
      teams.forEach(team => {
        if (!team.players || !Array.isArray(team.players) || team.players.length === 0) {
          console.log(`L'équipe ${team.name} n'a pas de joueurs ou format invalide`);
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

      console.log(`Total de ${playersWithTeamInfo.length} joueurs traités via les équipes`);
      setAllPlayers(playersWithTeamInfo);
      
      // Extraire les régions uniques pour les filtres
      const uniqueRegions = [...new Set(teams.map(team => team.region).filter(Boolean))];
      setAvailableRegions(uniqueRegions);

      if (playersWithTeamInfo.length === 0) {
        toast.warning("Aucun joueur trouvé dans la base de données");
      }
    } catch (error) {
      console.error("❌ Erreur lors du chargement des données via équipes :", error);
      toast.error("Erreur lors du chargement des données des joueurs");
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
