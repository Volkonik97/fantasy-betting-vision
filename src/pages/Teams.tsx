import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Team } from "@/utils/models/types";
import { getTeams } from "@/utils/database/teamsService";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SearchBar from "@/components/SearchBar";
import { toast } from "sonner";
import { formatSecondsToMinutesSeconds } from "@/utils/dataConverter";
import TeamLogoUploader from "@/components/team/TeamLogoUploader";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTeamLogoUrl } from "@/utils/database/teams/logoUploader";

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
        setTeams(loadedTeams);
        
        const uniqueRegions = ["All", ...new Set(loadedTeams.map(team => team.region))];
        setRegions(uniqueRegions);
      } else {
        toast.error("No team data found");
      }
    } catch (error) {
      console.error("Error loading teams:", error);
      toast.error("Error loading teams");
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 pt-24 pb-12">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Teams</h1>
            <p className="text-gray-600">
              Browse and analyze all professional League of Legends teams
            </p>
          </div>
          
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setShowLogoUploader(!showLogoUploader)}
          >
            <Upload size={16} />
            {showLogoUploader ? "Hide Logo Uploader" : "Upload Team Logos"}
          </Button>
        </div>
        
        {showLogoUploader && (
          <div className="mb-8 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <TeamLogoUploader 
              teams={teams} 
              onComplete={handleLogoUploadComplete} 
            />
          </div>
        )}
        
        <div className="mb-8">
          <SearchBar onSearch={handleSearch} />
        </div>
        
        <div className="mb-8">
          <div className="flex flex-wrap gap-3">
            {regions.map(region => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedRegion === region
                    ? "bg-lol-blue text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {region}
              </button>
            ))}
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-60">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lol-blue"></div>
          </div>
        ) : filteredTeams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.map((team) => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">Aucune équipe trouvée avec ces critères.</p>
            {teams.length === 0 && (
              <div className="mt-4">
                <p className="text-gray-500 mb-4">Aucune donnée n'a été importée.</p>
                <Link to="/data-import" className="text-lol-blue hover:underline">
                  Importer des données
                </Link>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

interface TeamCardProps {
  team: Team;
}

const TeamCard: React.FC<TeamCardProps> = ({ team }) => {
  const [logoUrl, setLogoUrl] = useState<string | null>(team.logo || null);
  
  useEffect(() => {
    const fetchLogo = async () => {
      if (team.id) {
        console.log(`Fetching logo for team card: ${team.name} (${team.id})`);
        
        if (team.id === "oe:team:71bd93fd1eab2c2f4ba60305ecabce2") {
          console.log("Team Valiant detected in TeamCard");
        }
        
        const url = await getTeamLogoUrl(team.id);
        if (url) {
          console.log(`Logo URL found for ${team.name} in card: ${url}`);
          setLogoUrl(url);
        }
      }
    };
    
    fetchLogo();
  }, [team.id, team.name]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300 h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt={`${team.name} logo`} 
                  className="w-10 h-10 object-contain"
                  onError={(e) => {
                    console.log(`Error loading logo for ${team.name} in card`);
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder.svg";
                  }}
                />
              ) : (
                <img 
                  src="/placeholder.svg" 
                  alt="Placeholder logo" 
                  className="w-10 h-10 object-contain p-2"
                />
              )}
            </div>
            <div>
              <CardTitle className="text-xl">{team.name}</CardTitle>
              <p className="text-sm text-gray-500">{team.region}</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Win Rate</p>
              <p className="text-lg font-semibold">{(team.winRate * 100).toFixed(0)}%</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Avg. Game Time</p>
              <p className="text-lg font-semibold">{formatSecondsToMinutesSeconds(team.averageGameTime)}</p>
            </div>
          </div>
          
          <div className="flex justify-between mt-4">
            <Link 
              to={`/teams/${team.id}`} 
              className="text-sm text-lol-blue hover:underline"
            >
              View Team Details
            </Link>
            <span className="text-sm text-gray-500">
              {team.players.length} Players
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Teams;
