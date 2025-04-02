
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Globe, Trophy } from "lucide-react";
import { tournaments } from "@/utils/mockData";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Tournaments = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("All");
  
  const regions = ["All", "International", "Korea", "China", "Europe", "North America"];
  
  const filteredTournaments = tournaments.filter(tournament => 
    (selectedRegion === "All" || tournament.region === selectedRegion) &&
    tournament.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleSearch = (query: string) => {
    setSearchTerm(query);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Tournaments</h1>
          <p className="text-gray-600">
            Browse League of Legends tournaments and their statistics
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
          {filteredTournaments.length > 0 ? (
            filteredTournaments.map((tournament, index) => (
              <motion.div
                key={tournament.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300 h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                        <img 
                          src={tournament.logo} 
                          alt={`${tournament.name} logo`} 
                          className="w-10 h-10 object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/placeholder.svg";
                          }}
                        />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{tournament.name}</CardTitle>
                        <p className="text-sm text-gray-500">{tournament.region}</p>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar size={16} className="text-gray-400" />
                        <span>
                          {new Date(tournament.startDate).toLocaleDateString()} - {new Date(tournament.endDate).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <Globe size={16} className="text-gray-400" />
                        <span>{tournament.region}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <a 
                        href={`/tournaments/${tournament.id}`} 
                        className="text-sm text-lol-blue hover:underline"
                      >
                        View Tournament Details
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-10 text-center">
              <p className="text-gray-500">No tournaments found matching your filters.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Tournaments;
