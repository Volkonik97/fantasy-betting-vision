
import React from "react";
import { motion } from "framer-motion";
import { Team } from "@/utils/models/types";
import { Button } from "@/components/ui/button";
import TeamStatistics from "@/components/TeamStatistics";
import ComparisonStatsCard from "./ComparisonStatsCard";
import PredictionCard from "./PredictionCard";

interface TeamComparisonResultProps {
  team1: Team;
  team2: Team;
  team1WinProb: number;
  team2WinProb: number;
  comparisonData: any[];
  team1TimelineStats?: any;
  team2TimelineStats?: any;
}

const TeamComparisonResult = ({
  team1,
  team2,
  team1WinProb,
  team2WinProb,
  comparisonData,
  team1TimelineStats,
  team2TimelineStats
}: TeamComparisonResultProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <ComparisonStatsCard 
            team1={team1} 
            team2={team2} 
            comparisonData={comparisonData} 
          />
        </div>
        
        <div>
          <PredictionCard 
            team1={team1} 
            team2={team2} 
            team1WinProb={team1WinProb} 
            team2WinProb={team2WinProb} 
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="w-full" onClick={() => window.location.href = `/teams/${team1.id}`}>
              Voir {team1.name}
            </Button>
            <Button variant="outline" className="w-full" onClick={() => window.location.href = `/teams/${team2.id}`}>
              Voir {team2.name}
            </Button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <TeamStatistics team={team1} timelineStats={team1TimelineStats} />
        </div>
        <div>
          <TeamStatistics team={team2} timelineStats={team2TimelineStats} />
        </div>
      </div>
    </motion.div>
  );
};

export default TeamComparisonResult;
