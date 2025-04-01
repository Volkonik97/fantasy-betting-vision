
import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Player } from "@/utils/models/types";
import Navbar from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getPlayerById } from "@/utils/database/playersService";
import { getPlayerStats } from "@/utils/database/matches/playerStats";
import { getPlayerTimelineStats } from "@/utils/database/matches/playerStats";
import { getTeamById } from "@/utils/database/teamsService";
import { toast } from "sonner";

// Import components
import PlayerHeader from "@/components/player/PlayerHeader";
import PlayerStatsOverview from "@/components/player/PlayerStatsOverview";
import PlayerChampionStats from "@/components/player/PlayerChampionStats";
import PlayerMatchStats from "@/components/player/PlayerMatchStats";
import PlayerTimelineStats from "@/components/player/PlayerTimelineStats";
import { isWinForPlayer, calculateAverages, getChampionStats } from "@/utils/player/playerStatsCalculator";

const PlayerDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [player, setPlayer] = useState<Player | null>(null);
  const [teamName, setTeamName] = useState<string>("");
  const [matchStats, setMatchStats] = useState<any[]>([]);
  const [timelineStats, setTimelineStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  
  const checkWinForPlayer = useCallback((stat: any) => {
    return player ? isWinForPlayer(stat, player.team) : false;
  }, [player]);
  
  useEffect(() => {
    let isMounted = true;
    
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
        
        if (isMounted) {
          setPlayer(playerData);
        }
        
        // Get team name
        if (playerData.team) {
          const team = await getTeamById(playerData.team);
          if (team && isMounted) {
            setTeamName(team.name);
          }
        }
        
        // Only load other data when it's needed based on active tab
        if (activeTab === "overview" || activeTab === "champions" || activeTab === "matches") {
          const stats = await getPlayerStats(id);
          if (isMounted) {
            setMatchStats(stats);
          }
        }
        
        if (activeTab === "timeline") {
          try {
            const timeline = await getPlayerTimelineStats(id);
            if (isMounted) {
              setTimelineStats(timeline);
            }
          } catch (timelineError) {
            console.error("Erreur lors du chargement des statistiques timeline:", timelineError);
            // Continue without timeline stats
          }
        }
        
      } catch (error) {
        console.error("Error loading player data:", error);
        toast.error("Erreur lors du chargement des données du joueur");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    loadPlayerData();
    
    return () => {
      isMounted = false;
    };
  }, [id, activeTab]);
  
  // Load specific data based on tab changes
  const handleTabChange = async (value: string) => {
    setActiveTab(value);
    
    if (!id || !player) return;
    
    // Load timeline data only when timeline tab is selected
    if (value === "timeline" && !timelineStats) {
      try {
        const timeline = await getPlayerTimelineStats(id);
        setTimelineStats(timeline);
      } catch (error) {
        console.error("Erreur lors du chargement des statistiques timeline:", error);
      }
    }
    
    // Load match stats if they haven't been loaded yet
    if ((value === "overview" || value === "champions" || value === "matches") && matchStats.length === 0) {
      try {
        const stats = await getPlayerStats(id);
        setMatchStats(stats);
      } catch (error) {
        console.error("Erreur lors du chargement des statistiques de match:", error);
      }
    }
  };
  
  // Calculate statistics
  const averageStats = matchStats.length > 0 ? calculateAverages(matchStats) : null;
  const championStats = matchStats.length > 0 && player ? getChampionStats(matchStats, player.team) : [];
  
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
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="w-full mb-4">
              <TabsTrigger value="overview" className="flex-1">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="timeline" className="flex-1">Timeline</TabsTrigger>
              <TabsTrigger value="champions" className="flex-1">Champions</TabsTrigger>
              <TabsTrigger value="matches" className="flex-1">Matchs</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              {activeTab === "overview" && (
                <PlayerStatsOverview averageStats={averageStats} />
              )}
            </TabsContent>
            
            <TabsContent value="timeline">
              {activeTab === "timeline" && (
                <PlayerTimelineStats timelineStats={timelineStats} />
              )}
            </TabsContent>
            
            <TabsContent value="champions">
              {activeTab === "champions" && (
                <PlayerChampionStats championStats={championStats} />
              )}
            </TabsContent>
            
            <TabsContent value="matches">
              {activeTab === "matches" && (
                <PlayerMatchStats 
                  matchStats={matchStats} 
                  isWinForPlayer={checkWinForPlayer} 
                />
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
};

export default PlayerDetails;
