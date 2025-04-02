
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Team } from "@/utils/models/types";
import TeamCard from "@/components/team/TeamCard";
import { getTeamLogoUrl } from "@/utils/database/teams/logoUtils";
import { preloadTeamLogos } from "@/utils/database/teams/images/logoCache";

interface TeamsListProps {
  teams: Team[];
  isLoading: boolean;
}

const TeamsList: React.FC<TeamsListProps> = ({ teams, isLoading }) => {
  // Préchargement des logos dès que la liste des équipes est disponible
  useEffect(() => {
    if (!isLoading && teams.length > 0) {
      const teamIds = teams.map(team => team.id);
      preloadTeamLogos(teamIds, getTeamLogoUrl);
    }
  }, [teams, isLoading]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-60">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lol-blue"></div>
      </div>
    );
  }
  
  if (teams.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">Aucune équipe trouvée avec ces critères.</p>
        <div className="mt-4">
          <p className="text-gray-500 mb-4">Aucune donnée n'a été importée ou les équipes ne sont pas disponibles.</p>
          <Link to="/data-import" className="text-lol-blue hover:underline">
            Importer des données
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {teams.map((team) => (
        <div key={team.id} className="h-full">
          <TeamCard key={team.id} team={team} />
        </div>
      ))}
    </div>
  );
};

export default TeamsList;
