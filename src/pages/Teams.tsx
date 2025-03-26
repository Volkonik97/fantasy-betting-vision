
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { teams, Team } from "@/utils/mockData";
import Navbar from "@/components/Navbar";
import TeamStatistics from "@/components/TeamStatistics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SearchBar from "@/components/SearchBar";

const Teams = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("All");
  
  const regions = ["All", "LCK", "LPL", "LEC", "LCS"];
  
  const filteredTeams = teams.filter(team => 
    (selectedRegion === "All" || team.region === selectedRegion) &&
    team.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleSearch = (query: string) => {
    setSearchTerm(query);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Teams</h1>
          <p className="text-gray-600">
            Browse and analyze all professional League of Legends teams
          </p>
        </div>
        
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      </main>
    </div>
  );
};

interface TeamCardProps {
  team: Team;
}

const TeamCard: React.FC<TeamCardProps> = ({ team }) => {
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
              <img 
                src={team.logo} 
                alt={`${team.name} logo`} 
                className="w-10 h-10 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder.svg";
                }}
              />
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
              <p className="text-lg font-semibold">{team.averageGameTime.toFixed(1)} min</p>
            </div>
          </div>
          
          <div className="flex justify-between mt-4">
            <a 
              href={`/teams/${team.id}`} 
              className="text-sm text-lol-blue hover:underline"
            >
              View Team Details
            </a>
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
