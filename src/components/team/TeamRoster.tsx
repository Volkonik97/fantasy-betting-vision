
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Player } from "@/utils/models/types";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { normalizeRoleName } from "@/utils/leagueData/assembler/modelConverter";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TeamRosterProps {
  players: Player[];
  teamName: string;
  teamId?: string;
}

const TeamRoster = ({ players: initialPlayers, teamName, teamId }: TeamRosterProps) => {
  const [players, setPlayers] = useState<Player[]>(initialPlayers || []);
  const [isLoading, setIsLoading] = useState<boolean>(initialPlayers.length === 0 && !!teamId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Function to fetch players directly from database if needed
    const fetchPlayersForTeam = async () => {
      if (initialPlayers.length > 0 || !teamId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        console.log(`Fetching players for team ${teamId} (${teamName}) directly from database`);
        
        const { data: playersData, error: playersError } = await supabase
          .from('players')
          .select('*')
          .eq('team_id', teamId);
        
        if (playersError) {
          console.error(`Error fetching players for team ${teamId}:`, playersError);
          setError("Erreur lors de la récupération des joueurs");
          toast.error("Impossible de charger les joueurs de l'équipe");
          return;
        }
        
        if (!playersData || playersData.length === 0) {
          console.warn(`No players found for team ${teamId} in database`);
          setError(null);
          return;
        }
        
        const fetchedPlayers: Player[] = playersData.map(player => ({
          id: player.id,
          name: player.name,
          role: normalizeRoleName(player.role || 'Mid'),
          image: player.image || '',
          team: player.team_id,
          teamName: teamName,
          kda: Number(player.kda) || 0,
          csPerMin: Number(player.cs_per_min) || 0,
          damageShare: Number(player.damage_share) || 0,
          championPool: Array.isArray(player.champion_pool) ? player.champion_pool : []
        }));
        
        console.log(`Found ${fetchedPlayers.length} players for team ${teamName} from database:`, fetchedPlayers);
        setPlayers(fetchedPlayers);
      } catch (err) {
        console.error("Error in fetchPlayersForTeam:", err);
        setError("Erreur lors du chargement des données");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPlayersForTeam();
  }, [initialPlayers, teamId, teamName]);
  
  // Use provided players or those fetched from database
  const activePlayers = players.length > 0 ? players : initialPlayers;

  // Sort players by role (Top, Jungle, Mid, ADC, Support)
  const sortedPlayers = [...activePlayers].sort((a, b) => {
    const roleOrder: Record<string, number> = {
      'Top': 0,
      'Jungle': 1,
      'Mid': 2,
      'ADC': 3,
      'Support': 4,
    };
    
    // Normalize role names to ensure proper sorting
    const roleA = normalizeRoleName(a.role);
    const roleB = normalizeRoleName(b.role);
    
    return (roleOrder[roleA] ?? 99) - (roleOrder[roleB] ?? 99);
  });

  // If loading
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mt-8 bg-white rounded-xl shadow-md p-6 border border-gray-100"
      >
        <h2 className="text-2xl font-bold mb-4">Joueurs de l'équipe</h2>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lol-blue"></div>
        </div>
      </motion.div>
    );
  }

  // If error or no players available
  if (error || (!activePlayers || activePlayers.length === 0)) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mt-8 bg-white rounded-xl shadow-md p-6 border border-gray-100"
      >
        <h2 className="text-2xl font-bold mb-4">Joueurs de l'équipe</h2>
        <p className="text-gray-500 text-center py-8">
          {error || "Aucun joueur trouvé pour cette équipe"}
        </p>
      </motion.div>
    );
  }

  console.log(`Affichage de ${sortedPlayers.length} joueurs pour l'équipe ${teamName}`);

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
                  {normalizeRoleName(player.role)}
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
