import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Team } from "@/utils/models/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatTime } from "@/utils/formatters/timeFormatter";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface TeamCardProps {
  team: Team;
}

const TeamCard: React.FC<TeamCardProps> = ({ team }) => {
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
              <Avatar className="w-12 h-12">
                <AvatarImage
                  src={team.logo || ''}
                  alt={`${team.name} logo`}
                  className="h-full w-full object-contain"
                />
                <AvatarFallback className="text-xs font-medium bg-gray-100 text-gray-700">
                  {team.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
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
              <p className="text-lg font-semibold">{(team.winRate * 100).toFixed(0)}%</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Avg. Game Time</p>
              <p className="text-lg font-semibold">{formatTime(team.averageGameTime)}</p>
            </div>
          </div>
          
          <div className="flex justify-between mt-auto pt-4">
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
