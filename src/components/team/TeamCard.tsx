import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Team } from "@/utils/models/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatSecondsToMinutesSeconds } from "@/utils/dataConverter";
import { getTeamLogoUrl, TEAM_VALIANT_ID } from "@/utils/database/teams/logoUtils";

interface TeamCardProps {
  team: Team;
}

const TeamCard: React.FC<TeamCardProps> = ({ team }) => {
  const [logoUrl, setLogoUrl] = useState<string | null>(team.logo || null);
  
  useEffect(() => {
    const fetchLogo = async () => {
      if (team.id) {
        console.log(`Fetching logo for team card: ${team.name} (${team.id})`);
        
        // Special handling for Team Valiant
        const isTeamValiant = team.id === TEAM_VALIANT_ID || 
                              team.name.toLowerCase().includes("valiant");
                              
        if (isTeamValiant) {
          console.log("Team Valiant detected in TeamCard - using special handling");
          // Use hardcoded path for Team Valiant
          setLogoUrl("public/lovable-uploads/4d612b58-6777-485c-8fd7-6c23892150e7.png");
          return;
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
                    target.classList.add("p-2");
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

export default TeamCard;
