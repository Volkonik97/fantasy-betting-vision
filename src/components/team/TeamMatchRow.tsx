
import React from "react";
import { Match, Team } from "@/utils/models/types";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface TeamMatchRowProps {
  match: Match;
  teamId: string;
  teamName: string;
}

const TeamMatchRow = ({ match, teamId, teamName }: TeamMatchRowProps) => {
  if (!match.teamBlue || !match.teamRed) {
    console.error(`Données de match incomplètes pour le match ${match.id}`);
    return null;
  }
  
  // Check if team is blue by ID or name for more flexibility
  const isBlue = match.teamBlue.id === teamId || match.teamBlue.name === teamName;
  const opponent = isBlue ? match.teamRed : match.teamBlue;
  const side = isBlue ? "Bleu" : "Rouge";
  
  const result = match.status === 'Completed' 
    ? (match.result?.winner === teamId ? 'Victoire' : 'Défaite') 
    : '-';
  const predictionAccurate = match.status === 'Completed' && match.result 
    ? match.predictedWinner === match.result.winner 
    : null;
  
  return (
    <tr className="border-t border-gray-100 hover:bg-gray-50">
      <td className="px-4 py-3">
        {new Date(match.date).toLocaleDateString()}
      </td>
      <td className="px-4 py-3">{match.tournament}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Avatar className="w-5 h-5 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
            <AvatarImage 
              src={opponent.logo} 
              alt={`${opponent.name} logo`} 
              className="w-4 h-4 object-contain"
            />
            <AvatarFallback className="text-xs">
              {opponent.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span>{opponent.name}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={`text-xs px-2 py-1 rounded ${
          isBlue ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
        }`}>
          {side}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className={`font-medium ${
          result === 'Victoire' ? 'text-green-600' : 
          result === 'Défaite' ? 'text-red-600' : 'text-gray-500'
        }`}>
          {result}
        </span>
      </td>
      <td className="px-4 py-3">
        {match.status === 'Completed' ? (
          <span className={`text-xs px-2 py-1 rounded ${
            predictionAccurate ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {predictionAccurate ? 'Correcte' : 'Incorrecte'}
          </span>
        ) : (
          <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
            {match.predictedWinner === teamId ? 'Victoire' : 'Défaite'} 
            ({isBlue 
              ? Math.round(match.blueWinOdds * 100)
              : Math.round(match.redWinOdds * 100)}%)
          </span>
        )}
      </td>
    </tr>
  );
};

export default TeamMatchRow;
