
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SideAnalysis from "@/components/SideAnalysis";
import { SideStatistics } from "@/utils/models/types";
import { getPlayerMatchStats, getTeamTimelineStats } from "@/utils/database/matches/playerStats";
import { toast } from "sonner";

interface TeamAnalysisTabsProps {
  blueTeamStats: SideStatistics | null;
  redTeamStats: SideStatistics | null;
  isLoading: boolean;
}

const TeamAnalysisTabs = ({ blueTeamStats, redTeamStats, isLoading }: TeamAnalysisTabsProps) => {
  const [isLoadingData, setIsLoadingData] = useState(isLoading);
  const [blueTeamDynamicStats, setBlueTeamDynamicStats] = useState<SideStatistics | null>(blueTeamStats);
  const [redTeamDynamicStats, setRedTeamDynamicStats] = useState<SideStatistics | null>(redTeamStats);

  // Function to get player match statistics and calculate team stats
  const getTeamPlayerStats = async (teamId: string | undefined) => {
    if (!teamId) return null;
    
    console.log(`Fetching player match stats for team ${teamId}`);
    
    try {
      // Get timeline stats with the optimized function
      const timelineStats = await getTeamTimelineStats(teamId);
      
      if (!timelineStats) {
        console.log(`No timeline stats found for team ${teamId}`);
        return null;
      }
      
      // Use base stats from the props and only update timeline
      return {
        teamId,
        blueWins: blueTeamStats?.blueWins || 50,
        redWins: redTeamStats?.redWins || 50,
        blueFirstBlood: blueTeamStats?.blueFirstBlood || 50,
        redFirstBlood: redTeamStats?.redFirstBlood || 50,
        blueFirstDragon: blueTeamStats?.blueFirstDragon || 50,
        redFirstDragon: redTeamStats?.redFirstDragon || 50,
        blueFirstHerald: blueTeamStats?.blueFirstHerald || 50,
        redFirstHerald: redTeamStats?.redFirstHerald || 50,
        blueFirstTower: blueTeamStats?.blueFirstTower || 50,
        redFirstTower: redTeamStats?.redFirstTower || 50,
        timelineStats
      };
    } catch (error) {
      console.error("Error calculating team stats:", error);
      return null;
    }
  };
  
  // Load team stats when component mounts
  useEffect(() => {
    const loadTeamStats = async () => {
      setIsLoadingData(true);
      
      try {
        // Get blue team ID and red team ID from props
        const blueTeamId = blueTeamStats?.teamId;
        const redTeamId = redTeamStats?.teamId;
        
        console.log("Loading dynamic team stats for:", { blueTeamId, redTeamId });
        
        // Process both teams in parallel
        const [dynamicBlueStats, dynamicRedStats] = await Promise.all([
          blueTeamId ? getTeamPlayerStats(blueTeamId) : null,
          redTeamId ? getTeamPlayerStats(redTeamId) : null
        ]);
        
        if (dynamicBlueStats) {
          console.log("Dynamic blue team stats loaded");
          setBlueTeamDynamicStats({
            ...blueTeamStats,
            timelineStats: dynamicBlueStats.timelineStats
          });
        } else {
          console.log("Using fallback blue team stats");
          setBlueTeamDynamicStats(blueTeamStats);
        }
        
        if (dynamicRedStats) {
          console.log("Dynamic red team stats loaded");
          setRedTeamDynamicStats({
            ...redTeamStats,
            timelineStats: dynamicRedStats.timelineStats
          });
        } else {
          console.log("Using fallback red team stats");
          setRedTeamDynamicStats(redTeamStats);
        }
      } catch (error) {
        console.error("Error loading dynamic team stats:", error);
        toast.error("Échec du chargement des statistiques d'équipe");
        
        // Fallback to props
        setBlueTeamDynamicStats(blueTeamStats);
        setRedTeamDynamicStats(redTeamStats);
      } finally {
        setIsLoadingData(false);
      }
    };
    
    // Only load if we have team IDs
    if (blueTeamStats?.teamId || redTeamStats?.teamId) {
      loadTeamStats();
    } else {
      setIsLoadingData(false);
    }
  }, [blueTeamStats, redTeamStats]);
  
  const renderTeamStats = (teamStats: SideStatistics | null, tabValue: string) => {
    if (isLoadingData) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lol-blue"></div>
        </div>
      );
    }
    
    if (!teamStats) {
      return (
        <div className="text-center p-8 bg-white rounded-xl border border-gray-100 shadow-subtle">
          <p className="text-gray-500">Aucune statistique disponible</p>
        </div>
      );
    }
    
    return <SideAnalysis statistics={teamStats} />;
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Tabs defaultValue="blueTeam">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="blueTeam" className="w-1/2">Blue Side</TabsTrigger>
          <TabsTrigger value="redTeam" className="w-1/2">Red Side</TabsTrigger>
        </TabsList>
        
        <TabsContent value="blueTeam">
          {renderTeamStats(blueTeamDynamicStats, "blueTeam")}
        </TabsContent>
        
        <TabsContent value="redTeam">
          {renderTeamStats(redTeamDynamicStats, "redTeam")}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default TeamAnalysisTabs;
