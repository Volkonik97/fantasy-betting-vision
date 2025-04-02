import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Team, Match, SideStatistics } from "@/utils/models/types";
import Navbar from "@/components/Navbar";
import { getTeamById } from "@/utils/database";
import { getMatchesByTeamId, clearMatchCache } from "@/utils/database";
import { getSideStatistics } from "@/utils/statistics/sideStatistics";
import { getTeamTimelineStats } from "@/utils/database/matches/playerStats";
import { toast } from "sonner";
import TeamHeader from "@/components/team/TeamHeader";
import TeamPlayersList from "@/components/team/TeamPlayersList";
import TeamRecentMatches from "@/components/team/TeamRecentMatches";
import TeamStatistics from "@/components/TeamStatistics";

const TeamDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [team, setTeam] = useState<Team | null>(null);
  const [teamMatches, setTeamMatches] = useState<Match[]>([]);
  const [sideStats, setSideStats] = useState<SideStatistics | null>(null);
  const [timelineStats, setTimelineStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadTeamData = async () => {
      if (!id) {
        setError("ID d'équipe manquant");
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Load team from database
        console.log(`Chargement de l'équipe avec l'ID: ${id}`);
        const foundTeam = await getTeamById(id);
        
        if (!foundTeam) {
          setError("Équipe non trouvée");
          setIsLoading(false);
          return;
        }
        
        // Log team info for debugging
        console.log(`Équipe trouvée: ${foundTeam.name}`);
        console.log(`Joueurs dans l'équipe:`, foundTeam.players?.length || 0);
        
        // Make sure we have players array initialized
        if (!foundTeam.players) {
          console.log("Players array is undefined, initializing empty array");
          foundTeam.players = [];
        }
        
        // Récupérer les statistiques par côté
        const sideStatsData = await getSideStatistics(id);
        console.log("Side statistics data:", sideStatsData);
        
        if (sideStatsData) {
          // Assign side statistics to the team object
          foundTeam.blueFirstBlood = sideStatsData.blueFirstBlood;
          foundTeam.redFirstBlood = sideStatsData.redFirstBlood;
          foundTeam.blueFirstDragon = sideStatsData.blueFirstDragon;
          foundTeam.redFirstDragon = sideStatsData.redFirstDragon;
          foundTeam.blueFirstHerald = sideStatsData.blueFirstHerald;
          foundTeam.redFirstHerald = sideStatsData.redFirstHerald;
          foundTeam.blueFirstTower = sideStatsData.blueFirstTower;
          foundTeam.redFirstTower = sideStatsData.redFirstTower;
        }
        
        setTeam(foundTeam);
        setSideStats(sideStatsData);
        
        // Clear match cache to ensure fresh data
        await clearMatchCache();
        
        // Run all data fetches in parallel for better performance
        const [teamMatchesArray, timelineData] = await Promise.all([
          getMatchesByTeamId(id),
          getTeamTimelineStats(id)
        ]);
        
        console.log(`Trouvé ${teamMatchesArray.length} matchs pour l'équipe ${id} (${foundTeam.name})`);
        
        // Trier les matchs par date (plus récent en premier)
        const sortedMatches = [...teamMatchesArray].sort((a, b) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
        
        setTeamMatches(sortedMatches);
        setTimelineStats(timelineData);
      } catch (err) {
        console.error("Erreur lors du chargement des données d'équipe:", err);
        setError("Erreur lors du chargement des données d'équipe");
        toast.error("Échec du chargement des détails de l'équipe");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTeamData();
  }, [id]);

  const handleBackClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/teams');
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lol-blue"></div>
      </div>
    );
  }
  
  if (error || !team) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{error || "Équipe non trouvée"}</h2>
          <Link to="/teams" className="text-lol-blue hover:underline">
            Retour à la liste des équipes
          </Link>
        </div>
      </div>
    );
  }
  
  // Log player data just before rendering to debug
  console.log("Rendering TeamDetails with players:", team.players?.length || 0);
  if (team.players && team.players.length > 0) {
    console.log("First player:", team.players[0].name, team.players[0].role);
  } else {
    console.warn("No players found in team object at render time");
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 pt-24 pb-12">
        <a
          href="/teams"
          onClick={handleBackClick}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-lol-blue transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          <span>Retour aux équipes</span>
        </a>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <TeamHeader team={team} />
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <TeamPlayersList players={team.players || []} teamName={team.name || ""} />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <TeamRecentMatches team={team} matches={teamMatches} />
            </motion.div>
          </div>
          
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <TeamStatistics team={team} timelineStats={timelineStats} />
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeamDetails;
