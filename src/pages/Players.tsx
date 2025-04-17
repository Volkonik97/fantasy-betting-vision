
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import { Player } from "@/utils/models/types";
import PlayerFilters from "@/components/players/PlayerFilters";
import PlayersList from "@/components/players/PlayersList";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { getAllPlayers, loadAllPlayersInBatches, searchPlayers, filterPlayers } from "@/services/playerService";
import { getAllTeams } from "@/services/teamService";
import { getPlayersCount } from "@/utils/database/players/playersService";
import { toast } from "sonner";

// Define an interface for player with team information
interface PlayerWithTeam extends Player {
  teamName: string;
  teamRegion: string;
}

const Players = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("All");
  const [selectedRegion, setSelectedRegion] = useState<string>("All");
  const [selectedSubRegion, setSelectedSubRegion] = useState<string>("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [allPlayers, setAllPlayers] = useState<PlayerWithTeam[]>([]);
  const [loading, setIsLoading] = useState(true);
  const [loadingAllPlayers, setLoadingAllPlayers] = useState(false);
  const [availableRegions, setAvailableRegions] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [displayedPlayers, setDisplayedPlayers] = useState<PlayerWithTeam[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<PlayerWithTeam[]>([]);
  const pageSize = 100;

  // Définition des rôles pour le filtrage - using consistent role names
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
    const hasActiveFilters = 
      searchTerm.trim() !== '' || 
      selectedRole !== "All" || 
      selectedRegion !== "All" || 
      selectedSubRegion !== "All" || 
      selectedCategory !== "All";
      
    if (!hasActiveFilters) {
      loadPlayersData(currentPage);
    } else if (allPlayers.length === 0) {
      loadAllPlayersForFiltering();
    }
    
    fetchPlayersCount();
  }, [currentPage]);

  useEffect(() => {
    if (allPlayers.length > 0) {
      applyFiltersAndSearch();
    }
  }, [searchTerm, selectedRole, selectedRegion, selectedSubRegion, selectedCategory, allPlayers]);

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

  // Basic implementation of loadPlayersData to ensure it works
  const loadPlayersData = async (page: number) => {
    try {
      setIsLoading(true);
      
      const playersData = await getAllPlayers(page, pageSize);
      const teamsData = await getAllTeams();
      
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
      }) as PlayerWithTeam[];
      
      setAllPlayers(enrichedPlayers);
      setDisplayedPlayers(enrichedPlayers);
      
      const uniqueRegions = [...new Set(teamsData.map(team => team.region).filter(Boolean))] as string[];
      setAvailableRegions(uniqueRegions);
      
    } catch (error) {
      console.error("Error loading players data:", error);
      toast.error("Erreur lors du chargement des données des joueurs");
    } finally {
      setIsLoading(false);
    }
  };

  // Simple implementation of loading all players
  const loadAllPlayersForFiltering = async () => {
    try {
      setLoadingAllPlayers(true);
      setIsLoading(true);
      toast.info("Chargement de tous les joueurs pour le filtrage...");
      
      const playersData = await loadAllPlayersInBatches();
      const teamsData = await getAllTeams();
      
      const teamsMap = new Map(teamsData.map(team => [team.id, team]));
      
      const enrichedPlayers = playersData.map(player => {
        const team = teamsMap.get(player.team);
        return {
          ...player,
          teamName: team?.name || "Équipe inconnue",
          teamRegion: team?.region || "Région inconnue"
        };
      }) as PlayerWithTeam[];
      
      setAllPlayers(enrichedPlayers);
      
      const uniqueRegions = [...new Set(teamsData.map(team => team.region).filter(Boolean))] as string[];
      setAvailableRegions(uniqueRegions);
      
      toast.success(`${enrichedPlayers.length} joueurs chargés`);
      applyFiltersAndSearch();
      
    } catch (error) {
      console.error("Error loading all players data:", error);
      toast.error("Erreur lors du chargement des données des joueurs");
    } finally {
      setIsLoading(false);
      setLoadingAllPlayers(false);
    }
  };

  // Basic filter implementation to ensure functionality
  const applyFiltersAndSearch = async () => {
    try {
      let filtered = filterPlayers(
        allPlayers, 
        selectedRole, 
        selectedRegion, 
        selectedSubRegion, 
        selectedCategory,
        regionCategories
      ) as PlayerWithTeam[];
      
      setFilteredPlayers(filtered);
      
      if (searchTerm.trim() !== '') {
        const searchResults = await searchPlayers<PlayerWithTeam>(
          filtered, 
          searchTerm
        );
        
        const totalFilteredPages = Math.ceil(searchResults.length / pageSize);
        const currentFilteredPage = Math.min(currentPage, totalFilteredPages || 1);
        
        const startIndex = (currentFilteredPage - 1) * pageSize;
        const paginatedResults = searchResults.slice(startIndex, startIndex + pageSize);
        
        setDisplayedPlayers(paginatedResults);
        setTotalPages(totalFilteredPages);
      } else {
        const totalFilteredPages = Math.ceil(filtered.length / pageSize);
        const currentFilteredPage = Math.min(currentPage, totalFilteredPages || 1);
        
        const startIndex = (currentFilteredPage - 1) * pageSize;
        const paginatedResults = filtered.slice(startIndex, startIndex + pageSize);
        
        setDisplayedPlayers(paginatedResults);
        setTotalPages(totalFilteredPages);
      }
      
    } catch (error) {
      console.error("Error applying filters:", error);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
    
    const hasActiveFilters = 
      term.trim() !== '' || 
      selectedRole !== "All" || 
      selectedRegion !== "All" || 
      selectedSubRegion !== "All" || 
      selectedCategory !== "All";
      
    if (hasActiveFilters && allPlayers.length <= pageSize) {
      loadAllPlayersForFiltering();
    }
  };

  const handleFilterChange = (type: string, value: string) => {
    setCurrentPage(1);
    
    switch(type) {
      case 'role':
        setSelectedRole(value);
        break;
      case 'region':
        setSelectedRegion(value);
        break;
      case 'subRegion':
        setSelectedSubRegion(value);
        break;
      case 'category':
        setSelectedCategory(value);
        break;
    }
    
    const hasActiveFilters = 
      searchTerm.trim() !== '' || 
      (type === 'role' ? value !== "All" : selectedRole !== "All") || 
      (type === 'region' ? value !== "All" : selectedRegion !== "All") || 
      (type === 'subRegion' ? value !== "All" : selectedSubRegion !== "All") || 
      (type === 'category' ? value !== "All" : selectedCategory !== "All");
      
    if (hasActiveFilters && allPlayers.length <= pageSize) {
      loadAllPlayersForFiltering();
    }
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    const hasActiveFilters = 
      searchTerm.trim() !== '' || 
      selectedRole !== "All" || 
      selectedRegion !== "All" || 
      selectedSubRegion !== "All" || 
      selectedCategory !== "All";
      
    if (!hasActiveFilters) {
      loadPlayersData(page);
    } else {
      applyFiltersAndSearch();
    }
  };

  const displayFilterCount = () => {
    if (filteredPlayers.length === 0) {
      return `0 joueur`;
    }
    return `${filteredPlayers.length} joueurs`;
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
          setSelectedRole={(role) => handleFilterChange('role', role)}
          selectedCategory={selectedCategory}
          handleCategorySelect={(category) => handleFilterChange('category', category)}
          selectedRegion={selectedRegion}
          handleRegionSelect={(region) => handleFilterChange('region', region)}
          selectedSubRegion={selectedSubRegion}
          setSelectedSubRegion={(subRegion) => handleFilterChange('subRegion', subRegion)}
          roles={roles}
          regionCategories={regionCategories}
          subRegions={subRegions}
        />

        <div className="mb-4 text-sm text-gray-500">
          {loading ? "Chargement..." : (
            loadingAllPlayers ? 
            "Chargement de tous les joueurs en cours..." : 
            `Affichage de ${displayedPlayers.length} sur ${displayFilterCount()} trouvés`
          )}
        </div>

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
              Total: {filteredPlayers.length > 0 ? filteredPlayers.length : totalPlayers} joueurs
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Players;
