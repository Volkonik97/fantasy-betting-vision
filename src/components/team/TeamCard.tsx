import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Team } from "@/utils/models/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatTime } from "@/utils/formatters/timeFormatter";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getTeamLogoUrl } from "@/utils/database/teams/logoUtils";

interface TeamCardProps {
  team: Team;
}

const TeamCard: React.FC<TeamCardProps> = ({ team }) => {
  const [logoUrl, setLogoUrl] = useState<string | null>(team.logo || null);
  const [logoLoading, setLogoLoading] = useState(true);
  const [logoError, setLogoError] = useState(false);
  
  const winRate = typeof team.winRate === 'number' ? team.winRate : 0;
  const avgGameTime = team.averageGameTime || 0;
  
  const playerCount = team.players ? team.players.length : 0;
  const hasPlayers = playerCount > 0;
  
  useEffect(() => {
    const fetchLogo = async () => {
      if (!team.id) return;

      setLogoLoading(true);
      setLogoError(false);
      
      try {
        if (team.logo && !team.logo.includes("undefined")) {
          setLogoUrl(team.logo);
          setLogoLoading(false);
          return;
        }
        
        const url = await getTeamLogoUrl(team.id);
        if (url && !url.includes("undefined")) {
          console.log(`Logo found for ${team.name} in card: ${url}`);
          setLogoUrl(url);
        } else {
          setLogoError(true);
        }
      } catch (error) {
        console.error(`Error fetching logo for ${team.name}:`, error);
        setLogoError(true);
      } finally {
        setLogoLoading(false);
      }
    };
    
    fetchLogo();
  }, [team.id, team.logo, team.name]);

  useEffect(() => {
    console.log(`TeamCard rendered for ${team.name}:`, {
      id: team.id,
      winRate: team.winRate,
      formattedWinRate: `${(winRate * 100).toFixed(0)}%`,
      blueWinRate: team.blueWinRate,
      redWinRate: team.redWinRate,
      playersCount: playerCount,
      hasPlayers: hasPlayers,
      avgGameTime: avgGameTime
    });
  }, [team, playerCount, hasPlayers, winRate, avgGameTime]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300 h-full flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
              {logoLoading ? (
                <div className="animate-pulse w-8 h-8 bg-gray-200 rounded-full"></div>
              ) : logoUrl && !logoError ? (
                <Avatar className="w-12 h-12">
                  <AvatarImage
                    src={logoUrl}
                    alt={`${team.name} logo`}
                    className="object-contain"
                    onError={() => {
                      console.log(`Error loading logo for ${team.name} in card`);
                      setLogoError(true);
                    }}
                  />
                  <AvatarFallback className="text-xs font-medium bg-gray-100 text-gray-700">
                    {team.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="text-xs font-medium bg-gray-100 text-gray-700">
                    {team.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
            <div>
              <CardTitle className="text-xl">{team.name}</CardTitle>
              <p className="text-sm text-gray-500">{team.region}</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Win Rate</p>
              <p className="text-lg font-semibold">{(winRate * 100).toFixed(0)}%</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Avg. Game Time</p>
              <p className="text-lg font-semibold">{formatTime(avgGameTime)}</p>
            </div>
          </div>
          
          <div className="flex justify-between mt-auto pt-4">
            <Link 
              to={`/team/${team.id}`} 
              className="text-sm text-lol-blue hover:underline"
            >
              View Team Details
            </Link>
            <span className="text-sm text-gray-500">
              {hasPlayers ? `${playerCount} Players` : 'No players'}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TeamCard;
