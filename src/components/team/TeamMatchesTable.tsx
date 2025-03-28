
import React from "react";
import { Match, Team } from "@/utils/models/types";
import TeamMatchRow from "./TeamMatchRow";

interface TeamMatchesTableProps {
  matches: Match[];
  teamId: string;
  teamName: string;
}

const TeamMatchesTable = ({ matches, teamId, teamName }: TeamMatchesTableProps) => {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-gray-50">
          <th className="px-4 py-3 text-left">Date</th>
          <th className="px-4 py-3 text-left">Tournoi</th>
          <th className="px-4 py-3 text-left">Adversaire</th>
          <th className="px-4 py-3 text-left">Côté</th>
          <th className="px-4 py-3 text-left">Résultat</th>
          <th className="px-4 py-3 text-left">Prédiction</th>
        </tr>
      </thead>
      <tbody>
        {matches.map(match => (
          <TeamMatchRow 
            key={match.id} 
            match={match} 
            teamId={teamId} 
            teamName={teamName}
          />
        ))}
      </tbody>
    </table>
  );
};

export default TeamMatchesTable;
