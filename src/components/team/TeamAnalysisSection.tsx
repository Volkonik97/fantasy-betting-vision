
import React from "react";
import { Team } from "@/utils/models/types";
import { SideStatistics } from "@/utils/models/types";
import PredictionChart from "@/components/PredictionChart";
import SideAnalysis from "@/components/SideAnalysis";

interface TeamAnalysisSectionProps {
  team: Team;
  sideStats: SideStatistics | null;
}

const TeamAnalysisSection = ({ team, sideStats }: TeamAnalysisSectionProps) => {
  return (
    <>
      <div className="lg:col-span-2">
        {team && (
          <PredictionChart 
            blueWinRate={team.blueWinRate * 100} 
            redWinRate={team.redWinRate * 100} 
            teamBlueName="Blue Side" 
            teamRedName="Red Side" 
          />
        )}
      </div>
      
      {sideStats && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Analyse de performance par côté</h2>
          <SideAnalysis statistics={sideStats} />
        </div>
      )}
    </>
  );
};

export default TeamAnalysisSection;
