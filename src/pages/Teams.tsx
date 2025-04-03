import React, { useState, useEffect } from "react";
import { Team } from "@/utils/models/types";
import { getTeams, clearTeamsCache } from "@/utils/database/teamsService";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import { toast } from "sonner";
import TeamsList from "@/components/team/TeamsList";
import TeamRegionFilter from "@/components/team/TeamRegionFilter";
import TeamLogoUploaderSection from "@/components/team/TeamLogoUploaderSection";
import TeamPageHeader from "@/components/team/TeamPageHeader";

const Teams = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [isLoading, setIsLoading] = useState(true);
  const [regions, setRegions] = useState<string[]>(["All"]);
  const [showLogoUploader, setShowLogoUploader] = useState(false);

  // ✅ Pagination
  const teamsPerPage = 20;
  const [currentPage, setCurrentPage] = useState(1);

  const regionCategories = {
    "All": ["All"],
    "Ligues Majeures": ["LCK", "LPL", "LTA N", "LEC"],
    "ERL": ["LFL", "PRM", "LVP SL", "NLC", "LIT", "AL", "TCL", "RL", "HLL", "LPLOL", "HW", "EBL", "ROL"],
    "Division 2": ["LCKC", "LFL2", "LRS", "LRN", "NEXO", "CD"],
    "Autres": ["LCP", "LJL", "LTA N", "PCS", "VCS"]
  };

  const loadTeams = async () => {
    try {
      setIsLoading(true);
      clearTeamsCache(); // ensure fresh data
      const loadedTeams = await getTeams();

      if (Array.isArray(loadedTeams) && loadedTeams.length > 0) {
        const sortedTeams = [...loadedTeams].sort((a, b) => a.name.localeCompare(b.name));
        setTeams(sortedTeams);

        const uniqueRegions = ["All", ...new Set(loadedTeams.map(team => team.region))];
        setRegions(uniqueRegions);
      } else {
        toast.error("Aucune équipe trouvée");
      }
    } catch (error) {
      console.error("❌ Erreur chargement équipes :", error);
      toast.error("Erreur lors du chargement des équipes");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTeams();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedRegion, selectedCategory]);

  const filteredTeams = teams.filter(team => {
    if (selectedCategory === "All") {
      return team.name.toLowerCase().includes(searchTerm.toLowerCase());
    }

    if (selectedRegion === "All") {
      return regionCategories[selectedCategory].some(region =>
        region === "All" || team.region === region
      ) && team.name.toLowerCase().includes(searchTerm.toLowerCase());
    }

    return team.region === selectedRegion &&
      team.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const paginatedTeams = filteredTeams.slice(
    (currentPage - 1) * teamsPerPage,
    currentPage * teamsPerPage
  );

  const handleSearch = (query: string) => {
    setSearchTerm(query);
  };

  const handleLogoUploadComplete = () => {
    loadTeams();
    setShowLogoUploader(false);
  };

  const toggleLogoUploader = () => {
    setShowLogoUploader(!showLogoUploader);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 pt-24 pb-12">
        <TeamPageHeader
          showLogoUploader={showLogoUploader}
          toggleLogoUploader={toggleLogoUploader}
        />

        <TeamLogoUploaderSection
          show={showLogoUploader}
          teams={teams}
          onComplete={handleLogoUploadComplete}
        />

        <div className="mb-8">
          <SearchBar onSearch={handleSearch} />
        </div>

        <TeamRegionFilter
          regions={regions}
          selectedRegion={selectedRegion}
          setSelectedRegion={setSelectedRegion}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          regionCategories={regionCategories}
        />

        <TeamsList teams={paginatedTeams} isLoading={isLoading} />

        {/* Pagination UI */}
        <div className="flex justify-center items-center mt-6 gap-4">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            ◀ Page précédente
          </button>

          <span className="text-sm text-gray-700">
            Page {currentPage} sur {Math.ceil(filteredTeams.length / teamsPerPage)}
          </span>

          <button
            onClick={() => setCurrentPage(p => p + 1)}
            disabled={currentPage * teamsPerPage >= filteredTeams.length}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Page suivante ▶
          </button>
        </div>
      </main>
    </div>
  );
};

export default Teams;
