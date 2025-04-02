
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Player } from "@/utils/models/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { normalizeRoleName } from "@/utils/leagueData/assembler/modelConverter";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ImageWithFallback from "@/components/ui/ImageWithFallback";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Shield } from "lucide-react";

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
    console.log(`TeamRoster - Initial players for ${teamName}:`, initialPlayers?.length || 0);
    console.log(`TeamRoster - TeamID: ${teamId}`);
    
    const fetchPlayersForTeam = async () => {
      // Si nous avons déjà des joueurs et qu'ils ne sont pas vides, ne pas récupérer à nouveau
      if (initialPlayers && initialPlayers.length > 0) {
        console.log(`Using ${initialPlayers.length} players from props for ${teamName}`);
        setPlayers(initialPlayers);
        return;
      }
      
      if (!teamId) {
        console.warn("No teamId provided for fetching players");
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        
        console.log(`Fetching players for team ${teamId} (${teamName}) directly from database`);
        
        // Essayer d'abord avec team_id
        let { data: playersData, error: playersError } = await supabase
          .from('players')
          .select('*')
          .eq('team_id', teamId);
          
        // Si aucun joueur n'est trouvé avec team_id, essayer avec team
        if ((!playersData || playersData.length === 0) && !playersError) {
          console.log(`No players found with team_id=${teamId}, trying with team=${teamId}`);
          const { data: alternateData, error: alternateError } = await supabase
            .from('players')
            .select('*')
            .eq('team', teamId);
            
          if (alternateData && alternateData.length > 0) {
            playersData = alternateData;
            playersError = alternateError;
          }
        }
        
        // Vérifier spécifiquement pour Hanwha Life Esports
        if (teamName.includes("Hanwha") || teamId === "oe:team:3a1d18f46bcb3716ebcfcf4ef068934") {
          console.log("Special case: Hanwha Life Esports - Checking for all players");
          
          const { data: hanwhaData, error: hanwhaError } = await supabase
            .from('players')
            .select('*')
            .ilike('team_id', '%hanwha%');
            
          if (hanwhaData && hanwhaData.length > 0) {
            console.log(`Found ${hanwhaData.length} Hanwha players by team_id pattern match`);
            playersData = hanwhaData;
            playersError = hanwhaError;
          } else {
            const { data: backupData, error: backupError } = await supabase
              .from('players')
              .select('*')
              .filter('team', 'eq', 'oe:team:3a1d18f46bcb3716ebcfcf4ef068934');
              
            if (backupData && backupData.length > 0) {
              console.log(`Found ${backupData.length} Hanwha players by exact team match`);
              playersData = backupData;
              playersError = backupError;
            }
          }
        }
        
        if (playersError) {
          console.error(`Error fetching players for team ${teamId}:`, playersError);
          setError("Erreur lors de la récupération des joueurs");
          toast.error("Impossible de charger les joueurs de l'équipe");
          return;
        }
        
        if (!playersData || playersData.length === 0) {
          console.warn(`No players found for team ${teamId} in database`);
          setError("Aucun joueur trouvé pour cette équipe");
          return;
        }
        
        const fetchedPlayers: Player[] = playersData.map(player => ({
          id: player.id,
          name: player.name,
          role: normalizeRoleName(player.role || 'Mid'),
          image: player.image || '',
          team: player.team_id || player.team,
          teamName: teamName,
          kda: Number(player.kda) || 0,
          csPerMin: Number(player.cs_per_min) || 0,
          damageShare: Number(player.damage_share) || 0,
          championPool: Array.isArray(player.champion_pool) ? player.champion_pool : []
        }));
        
        console.log(`Found ${fetchedPlayers.length} players for team ${teamName} from database`);
        if (fetchedPlayers.length > 0) {
          console.log("Sample player:", fetchedPlayers[0]);
        }
        
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
  
  const activePlayers = players.length > 0 ? players : initialPlayers;

  const sortedPlayers = [...(activePlayers || [])].sort((a, b) => {
    const roleOrder: Record<string, number> = {
      'Top': 0,
      'Jungle': 1,
      'Mid': 2,
      'ADC': 3,
      'Support': 4,
    };
    
    const roleA = normalizeRoleName(a.role);
    const roleB = normalizeRoleName(b.role);
    
    return (roleOrder[roleA] ?? 99) - (roleOrder[roleB] ?? 99);
  });

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
          <Link 
            to={`/players/${player.id}`} 
            key={player.id}
            className="block transition-transform hover:scale-105"
          >
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48 bg-gradient-to-b from-gray-50 to-gray-100">
                <ImageWithFallback
                  src={player.image}
                  alt={`${player.name}`}
                  className="w-full h-full object-cover"
                  fallback={
                    <div className="flex flex-col items-center justify-center h-full">
                      <Shield className="h-12 w-12 text-gray-300 mb-2" />
                      <span className="text-2xl font-bold text-gray-400">{player.name.charAt(0)}</span>
                    </div>
                  }
                />
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
                    <span className="font-medium">{player.kda ? player.kda.toFixed(1) : "0.0"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CS/min</span>
                    <span className="font-medium">{player.csPerMin ? player.csPerMin.toFixed(1) : "0.0"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dmg %</span>
                    <span className="font-medium">{player.damageShare ? (player.damageShare * 100).toFixed(0) : "0"}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </motion.div>
  );
};

export default TeamRoster;
