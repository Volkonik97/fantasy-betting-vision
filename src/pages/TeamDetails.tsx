
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Team, Match, SideStatistics } from "@/utils/models/types";
import Navbar from "@/components/Navbar";
import { getTeamById } from "@/utils/database/teamsService";
import { getMatches, clearMatchCache } from "@/utils/database/matchesService";
import { getSideStatistics } from "@/utils/statistics/sideStatistics";
import { getTeamTimelineStats } from "@/utils/database/matches/playerStats";
import { toast } from "sonner";
import TeamHeader from "@/components/team/TeamHeader";
import TeamPlayersList from "@/components/team/TeamPlayersList";
import TeamRecentMatches from "@/components/team/TeamRecentMatches";
import SideAnalysis from "@/components/SideAnalysis";

const TeamDetails = () => {
  const { id } = useParams<{ id: string }>();
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
        const foundTeam = await getTeamById(id);
        
        if (!foundTeam) {
          setError("Équipe non trouvée");
          setIsLoading(false);
          return;
        }
        
        setTeam(foundTeam);
        
        // Clear match cache to ensure fresh data
        await clearMatchCache();
        
        // Load all matches from database
        const allMatches = await getMatches();
        console.log(`Chargement de ${allMatches.length} matchs totaux depuis la base de données`);
        
        // Filter matches for this team, ensuring we strictly check for team ID matches
        const teamMatchesArray = allMatches.filter(match => {
          const matchesBlueTeam = match.teamBlue.id === id;
          const matchesRedTeam = match.teamRed.id === id;
          
          if (matchesBlueTeam || matchesRedTeam) {
            console.log(`Match trouvé pour l'équipe ${foundTeam.name}: ${match.id} (${match.tournament})`);
            return true;
          }
          return false;
        });
        
        console.log(`Trouvé ${teamMatchesArray.length} matchs pour l'équipe ${id} (${foundTeam.name})`);
        
        if (teamMatchesArray.length === 0 && allMatches.length > 0) {
          console.warn("Aucun match trouvé pour cette équipe. Débug des IDs d'équipe dans les données de match:");
          allMatches.slice(0, 5).forEach(match => {
            console.log(`Match ${match.id}: Équipe Bleue ID=${match.teamBlue.id}, Équipe Rouge ID=${match.teamRed.id}`);
          });
          console.log(`ID d'équipe recherché: ${id}`);
          
          // Additional debug: check if IDs might be case-sensitive or have whitespace issues
          const potentialMatches = allMatches.filter(match => 
            match.teamBlue.id.trim().toLowerCase() === id.trim().toLowerCase() || 
            match.teamRed.id.trim().toLowerCase() === id.trim().toLowerCase()
          );
          
          if (potentialMatches.length > 0) {
            console.log(`Trouvé ${potentialMatches.length} matchs potentiels avec comparaison insensible à la casse`);
            setTeamMatches(potentialMatches);
          }
        } else {
          setTeamMatches(teamMatchesArray);
        }
        
        // Load side statistics and timeline data
        try {
          const stats = await getSideStatistics(id);
          setSideStats(stats);
          
          const timeline = await getTeamTimelineStats(id);
          setTimelineStats(timeline);
        } catch (statsError) {
          console.error("Erreur lors du chargement des statistiques:", statsError);
          // Continue without statistics
        }
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
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 pt-24 pb-12">
        <Link
          to="/teams"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-lol-blue transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          <span>Retour aux équipes</span>
        </Link>
        
        <motion.div>
          <TeamHeader team={team} />
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2 space-y-8">
            <TeamPlayersList players={team?.players || []} teamName={team?.name || ""} />
            <TeamRecentMatches team={team} matches={teamMatches} />
          </div>
          
          <div className="space-y-8">
            {sideStats && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Analyse de performance par côté</h2>
                <SideAnalysis statistics={{
                  ...sideStats,
                  timelineStats: timelineStats
                }} />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeamDetails;
