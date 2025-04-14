
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import { Player } from "@/utils/models/types";
import PlayerFilters from "@/components/players/PlayerFilters";
import PlayersList from "@/components/players/PlayersList";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { getAllPlayers, searchPlayers, filterPlayers } from "@/services/playerService";
import { getAllTeams } from "@/services/teamService";
import { getPlayersCount } from "@/utils/database/players/playersService";
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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [displayedPlayers, setDisplayedPlayers] = useState<(Player & { teamName: string; teamRegion: string })[]>([]);
  const pageSize = 100;

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
    fetchPlayersCount();
  }, [currentPage]);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [allPlayers, searchTerm, selectedRole, selectedRegion, selectedSubRegion, selectedCategory]);

  const fetchPlayersCount = async () => {
    try {
      const count = await getPlayersCount();
      setTotalPlayers(count);
      setTotalPages(Math.ceil(count / pageSize));
      console.log(`Total players: ${count}, Total pages: ${Math.ceil(count / pageSize)}`);
    } catch (error) {
      console.error("Error fetching players count:", error);
    }
  };

  const loadPlayersData = async () => {
    try {
      setIsLoading(true);
      
      const [playersData, teamsData] = await Promise.all([
        getAllPlayers(currentPage, pageSize),
        getAllTeams()
      ]);
      
      console.log(`Loaded ${playersData.length} players (page ${currentPage}) and ${teamsData.length} teams`);
      
      if (playersData.length === 0) {
        toast.error("Aucun joueur trouvé dans la base de données");
        setIsLoading(false);
        return;
      }
      
      const teamsMap = new Map(teamsData.map(team => [team.id, team]));
      
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
      
      const uniqueRegions = [...new Set(teamsData.map(team => team.region).filter(Boolean))];
      setAvailableRegions(uniqueRegions);
      
    } catch (error) {
      console.error("Error loading players data:", error);
      toast.error("Erreur lors du chargement des données des joueurs");
    } finally {
      setIsLoading(false);
    }
  };

  const applyFiltersAndSearch = async () => {
    try {
      let filtered = filterPlayers(
        allPlayers, 
        selectedRole, 
        selectedRegion, 
        selectedSubRegion, 
        selectedCategory,
        regionCategories
      );
      
      if (searchTerm.trim() !== '') {
        // Use the generic type parameter with explicit type casting to preserve the full player type
        const searchResults = await searchPlayers<Player & { teamName: string; teamRegion: string }>(
          filtered, 
          searchTerm
        );
        setDisplayedPlayers(searchResults);
      } else {
        setDisplayedPlayers(filtered);
      }
      
      console.log(`Filtres appliqués: ${filtered.length} joueurs correspondent aux critères`);
    } catch (error) {
      console.error("Error applying filters:", error);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setSelectedRole("All");
    setSelectedCategory("All");
    setSelectedRegion("All");
    setSelectedSubRegion("All");
    setSearchTerm("");
    
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
          <SearchBar onSearch={handleSearch} value={searchTerm} />
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

        <PlayersList players={displayedPlayers} loading={loading} />

        {!loading && totalPages > 1 && (
          <div className="mt-8">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => handlePageChange(currentPage - 1)}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                
                <PaginationItem className="flex items-center mx-2">
                  <span>Page {currentPage} sur {totalPages}</span>
                </PaginationItem>
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => handlePageChange(currentPage + 1)}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
            <div className="text-center text-sm text-gray-500 mt-2">
              Total: {totalPlayers} joueurs
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Players;
