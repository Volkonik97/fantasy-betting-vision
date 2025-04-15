import React, { useState, useEffect } from "react";
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

// Import our components
import PlayerHeader from "@/components/player/PlayerHeader";
import PlayerStatsOverview from "@/components/player/PlayerStatsOverview";
import PlayerChampionStats from "@/components/player/PlayerChampionStats";
import PlayerMatchStats from "@/components/player/PlayerMatchStats";
import PlayerTimelineStats from "@/components/player/PlayerTimelineStats";
import { isWinForPlayer, getChampionStats } from "@/utils/player/playerStatsCalculator";

const PlayerDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [player, setPlayer] = useState<Player | null>(null);
  const [teamName, setTeamName] = useState<string>("");
  const [matchStats, setMatchStats] = useState<any[]>([]);
  const [timelineStats, setTimelineStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadPlayerData = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        console.log(`Chargement des données pour le joueur ${id}`);
        
        // Get player data from the database
        const playerData = await getPlayerById(id);
        if (!playerData) {
          console.error(`Player not found with ID: ${id}`);
          toast.error("Joueur non trouvé");
          setIsLoading(false);
          return;
        }
        
        console.log("Données du joueur récupérées:", playerData);
        // Log the damage share value for debugging
        console.log(`Player ${playerData.name} damageShare:`, playerData.damageShare, typeof playerData.damageShare);
        console.log(`Player ${playerData.name} goldShare:`, playerData.gold_share_percent, typeof playerData.gold_share_percent);
        console.log(`Player ${playerData.name} match_count:`, playerData.match_count, typeof playerData.match_count);
        
        setPlayer(playerData);
        
        // Get team name
        if (playerData.team) {
          console.log(`Récupération des détails de l'équipe ${playerData.team}`);
          const team = await getTeamById(playerData.team);
          if (team) {
            setTeamName(team.name);
            console.log(`Nom de l'équipe trouvé: ${team.name}`);
          } else {
            console.warn(`Équipe ${playerData.team} non trouvée dans la base de données`);
          }
        }
        
        // Get match statistics for champion stats calculation
        console.log(`Récupération des statistiques de match pour le joueur ${id}`);
        const stats = await getPlayerStats(id);
        console.log("Statistiques de match récupérées:", stats);
        setMatchStats(stats || []);
        
        // Get timeline statistics for this player
        try {
          console.log(`Récupération des statistiques timeline pour le joueur ${id}`);
          const timeline = await getPlayerTimelineStats(id);
          console.log("Statistiques timeline récupérées:", timeline);
          setTimelineStats(timeline);
        } catch (timelineError) {
          console.error("Erreur lors du chargement des statistiques timeline:", timelineError);
          // Continue without timeline stats
        }
        
      } catch (error) {
        console.error("Error loading player data:", error);
        toast.error("Erreur lors du chargement des données du joueur");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPlayerData();
  }, [id]);

  // Use champion stats calculation from match data
  const championStats = Array.isArray(matchStats) && matchStats.length > 0 
    ? getChampionStats(matchStats, player?.team) 
    : [];
  
  // Calculate total matches and wins from champion stats
  const totalMatches = championStats.reduce((total, champ) => total + champ.games, 0);
  const totalWins = championStats.reduce((total, champ) => total + champ.wins, 0);
  
  // Create average stats directly from the player object
  const averageStats = player ? {
    kills: player.avg_kills || 0,
    deaths: player.avg_deaths || 0,
    assists: player.avg_assists || 0,
    kda: player.kda || 0,
    csPerMin: player.cspm || player.csPerMin || 0,
    damageShare: player.damageShare || 0,
    goldShare: player.gold_share_percent || player.earned_gold_share || 0,
    visionScore: player.vspm || 0,
    wardsCleared: player.wcpm || 0,
    // Use match_count from database if available
    games: player.match_count && player.match_count > 0 ? player.match_count : totalMatches,
    // Calculate wins from total games and the player win rate if match_count is available
    // Otherwise use win count from champion stats
    wins: player.match_count && player.match_count > 0 ? Math.round((player.match_count * 0.5)) : totalWins,
    // Calculate win rate based on available data
    winRate: player.match_count && player.match_count > 0 
      ? 50 // Default win rate of 50% when we only have match_count but no detailed win data
      : totalMatches > 0 ? (totalWins / totalMatches) * 100 : 0
  } : null;
  
  // Log averageStats for debugging with more details
  if (averageStats) {
    console.log("Average stats calculated:", {
      kda: averageStats.kda,
      csPerMin: averageStats.csPerMin,
      damageShare: averageStats.damageShare,
      goldShare: averageStats.goldShare,
      goldShareType: typeof averageStats.goldShare,
      visionScore: averageStats.visionScore,
      wardsCleared: averageStats.wardsCleared,
      games: averageStats.games,
      playerMatchCount: player?.match_count,
      totalMatchesFromChampStats: totalMatches,
      wins: averageStats.wins,
      totalWinsFromChampStats: totalWins,
      winRate: averageStats.winRate
    });
  }
  
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
  
  // Handle case when no match stats available
  const hasMatchStats = Array.isArray(matchStats) && matchStats.length > 0;
  
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
        
        {/* Player Header - Use player data directly from the database */}
        <PlayerHeader 
          player={player} 
          teamName={teamName} 
        />
        
        {!hasMatchStats && (
          <div className="mt-6 bg-amber-50 border-l-4 border-amber-400 p-4 text-amber-700">
            <p className="font-medium">Aucune statistique de match disponible pour ce joueur.</p>
            <p className="text-sm mt-1">Statistiques générales issues de la base de données sont affichées.</p>
          </div>
        )}
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Tabs defaultValue="overview">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="overview" className="flex-1">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="timeline" className="flex-1">Timeline</TabsTrigger>
              <TabsTrigger value="champions" className="flex-1">Champions</TabsTrigger>
              <TabsTrigger value="matches" className="flex-1">Matchs</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <PlayerStatsOverview averageStats={averageStats} />
            </TabsContent>
            
            <TabsContent value="timeline">
              <PlayerTimelineStats timelineStats={timelineStats} />
            </TabsContent>
            
            <TabsContent value="champions">
              <PlayerChampionStats championStats={championStats} />
            </TabsContent>
            
            <TabsContent value="matches">
              <PlayerMatchStats 
                matchStats={matchStats || []} 
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
