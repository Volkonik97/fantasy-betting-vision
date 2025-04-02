
import React from "react";
import { motion } from "framer-motion";
import { Player } from "@/utils/models/types";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface TeamRosterProps {
  players: Player[];
  teamName: string;
}

const TeamRoster = ({ players, teamName }: TeamRosterProps) => {
  // Sort players by role (Top, Jungle, Mid, ADC, Support)
  const sortedPlayers = [...players].sort((a, b) => {
    const roleOrder: Record<string, number> = {
      'Top': 0,
      'Jungle': 1,
      'Mid': 2,
      'ADC': 3,
      'Support': 4,
    };
    
    return (roleOrder[a.role] ?? 99) - (roleOrder[b.role] ?? 99);
  });

  // If no players available
  if (!players || players.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mt-8 bg-white rounded-xl shadow-md p-6 border border-gray-100"
      >
        <h2 className="text-2xl font-bold mb-4">Joueurs de l'équipe</h2>
        <p className="text-gray-500 text-center py-8">
          Aucun joueur trouvé pour cette équipe
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-8 bg-white rounded-xl shadow-md p-6 border border-gray-100"
    >
      <h2 className="text-2xl font-bold mb-6">Joueurs de l'équipe</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {sortedPlayers.map((player) => (
          <Card key={player.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative h-48 bg-gradient-to-b from-gray-50 to-gray-100">
              {player.image ? (
                <img 
                  src={player.image} 
                  alt={player.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = "/placeholder.svg";
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Avatar className="h-24 w-24">
                    <AvatarFallback className="text-3xl">
                      {player.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              )}
              <div className="absolute top-0 right-0 m-2">
                <Badge className="bg-black bg-opacity-70 hover:bg-opacity-80 text-white border-none">
                  {player.role}
                </Badge>
              </div>
            </div>
            <CardContent className="pt-4">
              <h3 className="font-bold text-lg truncate">{player.name}</h3>
              <div className="flex flex-col mt-2 text-sm text-gray-500">
                <div className="flex justify-between">
                  <span>KDA</span>
                  <span className="font-medium">{player.kda.toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span>CS/min</span>
                  <span className="font-medium">{player.csPerMin.toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Dmg %</span>
                  <span className="font-medium">{(player.damageShare * 100).toFixed(0)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
};

export default TeamRoster;
