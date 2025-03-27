
import React from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SideAnalysis from "@/components/SideAnalysis";
import { SideStatistics } from "@/utils/models/types";

interface TeamAnalysisTabsProps {
  blueTeamStats: SideStatistics | null;
  redTeamStats: SideStatistics | null;
  isLoading: boolean;
}

const TeamAnalysisTabs = ({ blueTeamStats, redTeamStats, isLoading }: TeamAnalysisTabsProps) => {
  const renderTeamStats = (teamStats: SideStatistics | null, tabValue: string) => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lol-blue"></div>
        </div>
      );
    }
    
    if (!teamStats) {
      return (
        <div className="text-center p-8 bg-white rounded-xl border border-gray-100 shadow-subtle">
          <p className="text-gray-500">No statistics available</p>
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
          {renderTeamStats(blueTeamStats, "blueTeam")}
        </TabsContent>
        
        <TabsContent value="redTeam">
          {renderTeamStats(redTeamStats, "redTeam")}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default TeamAnalysisTabs;
