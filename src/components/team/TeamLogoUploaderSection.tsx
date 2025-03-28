
import React from "react";
import { Team } from "@/utils/models/types";
import TeamLogoUploader from "@/components/team/TeamLogoUploader";
import SingleTeamLogoUploader from "@/components/team/SingleTeamLogoUploader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
      <Tabs defaultValue="bulk" className="w-full">
        <TabsList className="mb-4 grid grid-cols-2 w-full max-w-md mx-auto">
          <TabsTrigger value="bulk">Upload multiple</TabsTrigger>
          <TabsTrigger value="single">Équipe unique</TabsTrigger>
        </TabsList>
        
        <TabsContent value="bulk">
          <TeamLogoUploader 
            teams={teams} 
            onComplete={onComplete} 
          />
        </TabsContent>
        
        <TabsContent value="single">
          <SingleTeamLogoUploader 
            teams={teams} 
            onComplete={onComplete} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeamLogoUploaderSection;
