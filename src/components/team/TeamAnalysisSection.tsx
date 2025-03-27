
import React from "react";
import { Team } from "@/utils/models/types";
import { SideStatistics } from "@/utils/models/types";
import TeamStatistics from "@/components/TeamStatistics";
import PredictionChart from "@/components/PredictionChart";
import SideAnalysis from "@/components/SideAnalysis";

interface TeamAnalysisSectionProps {
  team: Team;
  sideStats: SideStatistics | null;
}

const TeamAnalysisSection = ({ team, sideStats }: TeamAnalysisSectionProps) => {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          {team && <TeamStatistics team={team} />}
        </div>
        
        <div>
          {team && (
            <PredictionChart 
              blueWinRate={team.blueWinRate * 100} 
              redWinRate={team.redWinRate * 100} 
              teamBlueName="Blue Side" 
              teamRedName="Red Side" 
            />
          )}
        </div>
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
