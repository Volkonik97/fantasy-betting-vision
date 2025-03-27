
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Player } from "@/utils/models/types";
import Navbar from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getPlayerById } from "@/utils/database/playersService";
import { getPlayerStats } from "@/utils/database/matches/playerStats";
import { getTeamById } from "@/utils/database/teamsService";
import { toast } from "sonner";

// Import our components
import PlayerHeader from "@/components/player/PlayerHeader";
import PlayerStatsOverview from "@/components/player/PlayerStatsOverview";
import PlayerChampionStats from "@/components/player/PlayerChampionStats";
import PlayerMatchStats from "@/components/player/PlayerMatchStats";
import { isWinForPlayer, calculateAverages, getChampionStats } from "@/utils/player/playerStatsCalculator";

const PlayerDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [player, setPlayer] = useState<Player | null>(null);
  const [teamName, setTeamName] = useState<string>("");
  const [matchStats, setMatchStats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadPlayerData = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        // Get player data
        const playerData = await getPlayerById(id);
        if (!playerData) {
          toast.error("Joueur non trouvé");
          setIsLoading(false);
          return;
        }
        
        console.log("Player data:", playerData);
        setPlayer(playerData);
        
        // Get team name
        if (playerData.team) {
          const team = await getTeamById(playerData.team);
          if (team) {
            setTeamName(team.name);
          }
        }
        
        // Get match statistics directly for this player
        const stats = await getPlayerStats(id);
        console.log("Player match stats:", stats);
        setMatchStats(stats);
        
      } catch (error) {
        console.error("Error loading player data:", error);
        toast.error("Erreur lors du chargement des données du joueur");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPlayerData();
  }, [id]);
  
  // Calculate statistics
  const averageStats = calculateAverages(matchStats);
  const championStats = getChampionStats(matchStats, player?.team);
  
  // Handle loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lol-blue"></div>
      </div>
    );
  }
  
  // Handle player not found
  if (!player) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Joueur non trouvé</h2>
          <Link to="/players" className="text-lol-blue hover:underline">
            Retour à la liste des joueurs
          </Link>
        </div>
      </div>
    );
  }
  
  // Helper function for checking if a player won a match
  const checkWinForPlayer = (stat: any) => {
    return isWinForPlayer(stat, player.team);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 pt-24 pb-12">
        <Link
          to="/players"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-lol-blue transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          <span>Retour aux joueurs</span>
        </Link>
        
        {/* Player Header - Pass calculated stats if available */}
        <PlayerHeader 
          player={player} 
          teamName={teamName} 
          kdaOverride={averageStats?.kda}
          cspmOverride={averageStats?.csPerMin}
          damageShareOverride={averageStats?.damageShare}
        />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Tabs defaultValue="overview">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="overview" className="flex-1">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="champions" className="flex-1">Champions</TabsTrigger>
              <TabsTrigger value="matches" className="flex-1">Matchs</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <PlayerStatsOverview averageStats={averageStats} />
            </TabsContent>
            
            <TabsContent value="champions">
              <PlayerChampionStats championStats={championStats} />
            </TabsContent>
            
            <TabsContent value="matches">
              <PlayerMatchStats 
                matchStats={matchStats} 
                isWinForPlayer={checkWinForPlayer} 
              />
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
};

export default PlayerDetails;
