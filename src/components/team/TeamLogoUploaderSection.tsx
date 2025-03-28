
import React from "react";
import { Team } from "@/utils/models/types";
import TeamLogoUploader from "@/components/team/TeamLogoUploader";

interface TeamLogoUploaderSectionProps {
  show: boolean;
  teams: Team[];
  onComplete: () => void;
}

const TeamLogoUploaderSection: React.FC<TeamLogoUploaderSectionProps> = ({ 
  show, 
  teams, 
  onComplete 
}) => {
  if (!show) return null;
  
  return (
    <div className="mb-8 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <TeamLogoUploader 
        teams={teams} 
        onComplete={onComplete} 
      />
    </div>
  );
};

export default TeamLogoUploaderSection;
