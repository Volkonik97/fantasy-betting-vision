
import React, { useState, useEffect } from "react";
import { Team } from "@/utils/models/types";
import { getTeams } from "@/utils/database/teamsService";
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
  const [isLoading, setIsLoading] = useState(true);
  const [regions, setRegions] = useState<string[]>(["All"]);
  const [showLogoUploader, setShowLogoUploader] = useState(false);
  
  const loadTeams = async () => {
    try {
      setIsLoading(true);
      const loadedTeams = await getTeams();
      
      if (Array.isArray(loadedTeams) && loadedTeams.length > 0) {
        console.log("Successfully loaded teams:", loadedTeams.length);
        setTeams(loadedTeams);
        
        const uniqueRegions = ["All", ...new Set(loadedTeams.map(team => team.region))];
        setRegions(uniqueRegions);
      } else {
        console.warn("No teams loaded from database");
        toast.error("Aucune équipe trouvée");
      }
    } catch (error) {
      console.error("Error loading teams:", error);
      toast.error("Erreur lors du chargement des équipes");
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    loadTeams();
  }, []);
  
  const filteredTeams = teams.filter(team => 
    (selectedRegion === "All" || team.region === selectedRegion) &&
    team.name.toLowerCase().includes(searchTerm.toLowerCase())
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

  console.log("Filtered teams:", filteredTeams.length, "of", teams.length, "total teams");

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
        />
        
        <TeamsList teams={filteredTeams} isLoading={isLoading} />
      </main>
    </div>
  );
};

export default Teams;
