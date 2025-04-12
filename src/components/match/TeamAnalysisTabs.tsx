import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SideAnalysis from "@/components/SideAnalysis";
import { SideStatistics } from "@/utils/models/types";
import { getTeamTimelineStats } from "@/utils/database/matches/playerStats";
import { toast } from "sonner";
import { formatSecondsToMinutesSeconds } from "@/utils/dataConverter";

interface TeamAnalysisTabsProps {
  blueTeamStats: SideStatistics | null;
  redTeamStats: SideStatistics | null;
  isLoading: boolean;
}

const TeamAnalysisTabs = ({ blueTeamStats, redTeamStats, isLoading }: TeamAnalysisTabsProps) => {
  const [isLoadingData, setIsLoadingData] = useState(isLoading);
  const [blueTeamDynamicStats, setBlueTeamDynamicStats] = useState<SideStatistics | null>(blueTeamStats);
  const [redTeamDynamicStats, setRedTeamDynamicStats] = useState<SideStatistics | null>(redTeamStats);

  const getTeamPlayerStats = async (teamId: string | undefined, originalStats: SideStatistics | null) => {
    if (!teamId || !originalStats) {
      console.log(`Cannot get player stats: teamId=${teamId}, originalStats=${!!originalStats}`);
      return originalStats;
    }
    
    console.log(`Fetching player match stats for team ${teamId}`);
    
    try {
      const timelineStats = await getTeamTimelineStats(teamId);
      
      if (!timelineStats) {
        console.log(`No timeline stats found for team ${teamId}, using original data`);
        return originalStats;
      }
      
      console.log(`Found timeline stats for team ${teamId}:`, timelineStats);
      
      return {
        ...originalStats,
        timelineStats: timelineStats as TimelineStats
      };
    } catch (error) {
      console.error(`Error calculating team stats for ${teamId}:`, error);
      return originalStats;
    }
  };
  
  useEffect(() => {
    const loadTeamStats = async () => {
      setIsLoadingData(true);
      
      try {
        const blueTeamId = blueTeamStats?.teamId;
        const redTeamId = redTeamStats?.teamId;
        
        console.log("Loading dynamic team stats for:", { blueTeamId, redTeamId });
        
        if (!blueTeamId && !redTeamId) {
          console.log("No team IDs available, using static data");
          setBlueTeamDynamicStats(blueTeamStats);
          setRedTeamDynamicStats(redTeamStats);
          setIsLoadingData(false);
          return;
        }
        
        if (blueTeamId) {
          const dynamicBlueStats = await getTeamPlayerStats(blueTeamId, blueTeamStats);
          console.log("Dynamic blue team stats loaded:", !!dynamicBlueStats);
          if (dynamicBlueStats) {
            setBlueTeamDynamicStats(dynamicBlueStats);
          }
        } else {
          setBlueTeamDynamicStats(blueTeamStats);
        }
        
        if (redTeamId) {
          const dynamicRedStats = await getTeamPlayerStats(redTeamId, redTeamStats);
          console.log("Dynamic red team stats loaded:", !!dynamicRedStats);
          if (dynamicRedStats) {
            setRedTeamDynamicStats(dynamicRedStats);
          }
        } else {
          setRedTeamDynamicStats(redTeamStats);
        }
      } catch (error) {
        console.error("Error loading dynamic team stats:", error);
        toast.error("Échec du chargement des statistiques d'équipe");
        
        setBlueTeamDynamicStats(blueTeamStats);
        setRedTeamDynamicStats(redTeamStats);
      } finally {
        setIsLoadingData(false);
      }
    };
    
    loadTeamStats();
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
