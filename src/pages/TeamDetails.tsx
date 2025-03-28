
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Team, Match, SideStatistics } from "@/utils/models/types";
import Navbar from "@/components/Navbar";
import { getTeamById } from "@/utils/database/teamsService";
import { getMatches } from "@/utils/database/matchesService";
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
        
        // Load team from database
        const foundTeam = await getTeamById(id);
        
        if (!foundTeam) {
          setError("Équipe non trouvée");
          setIsLoading(false);
          return;
        }
        
        setTeam(foundTeam);
        
        // Load ALL matches from database
        const allMatches = await getMatches();
        console.log(`Loaded ${allMatches.length} total matches from database`);
        
        // Filter matches associated with this team
        const filteredMatches = allMatches.filter(
          match => match.teamBlue.id === id || match.teamRed.id === id
        );
        
        console.log(`Found ${filteredMatches.length} matches for team ${id}`);
        setTeamMatches(filteredMatches);
        
        // Load side statistics
        if (foundTeam.id) {
          try {
            const stats = await getSideStatistics(foundTeam.id);
            setSideStats(stats);
          } catch (statsError) {
            console.error("Erreur lors du chargement des statistiques côté:", statsError);
            // Continue without side stats
          }
          
          // Load timeline statistics
          try {
            const timeline = await getTeamTimelineStats(foundTeam.id);
            console.log("Timeline stats loaded:", timeline);
            setTimelineStats(timeline);
          } catch (timelineError) {
            console.error("Erreur lors du chargement des statistiques timeline:", timelineError);
            // Continue without timeline stats
          }
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
            <TeamPlayersList players={team.players} teamName={team.name} />
            <TeamRecentMatches team={team} matches={teamMatches} />
          </div>
          
          <div className="space-y-8">
            {/* Affichage des statistiques par côté avec timeline */}
            {sideStats && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Analyse de performance par côté</h2>
                <SideAnalysis statistics={{
                  ...sideStats,
                  timelineStats: timelineStats // On utilise les timelineStats ici
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
