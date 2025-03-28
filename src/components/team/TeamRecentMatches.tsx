
import React from "react";
import { motion } from "framer-motion";
import { Team, Match } from "@/utils/models/types";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getTeamLogoUrl } from "@/utils/database/teams/logoUtils";
import { useEffect, useState } from "react";

interface TeamRecentMatchesProps {
  team: Team;
  matches: Match[];
}

const TeamRecentMatches = ({ team, matches }: TeamRecentMatchesProps) => {
  const [matchesWithLogos, setMatchesWithLogos] = useState<Match[]>(matches);

  useEffect(() => {
    const fetchLogos = async () => {
      const updatedMatches = await Promise.all(
        matches.map(async (match) => {
          const isBlue = match.teamBlue.id === team.id;
          const opponent = isBlue ? match.teamRed : match.teamBlue;
          
          // Only fetch a new logo if it doesn't already exist
          if (!opponent.logo || opponent.logo === "") {
            try {
              const logoUrl = await getTeamLogoUrl(opponent.id);
              if (logoUrl) {
                // Create a new opponent object with the logo
                const updatedOpponent = { ...opponent, logo: logoUrl };
                
                // Return updated match with the new opponent
                return isBlue 
                  ? { ...match, teamRed: updatedOpponent }
                  : { ...match, teamBlue: updatedOpponent };
              }
            } catch (error) {
              console.error(`Error fetching logo for team ${opponent.id}:`, error);
            }
          }
          
          // Return original match if no logo update was needed
          return match;
        })
      );
      
      setMatchesWithLogos(updatedMatches);
    };
    
    fetchLogos();
  }, [matches, team.id]);

  if (matchesWithLogos.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
      className="mt-8"
    >
      <h2 className="text-2xl font-bold mb-4">Matchs récents</h2>
      <div className="bg-white rounded-xl border border-gray-100 shadow-subtle overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Tournoi</th>
              <th className="px-4 py-3 text-left">Adversaire</th>
              <th className="px-4 py-3 text-left">Résultat</th>
              <th className="px-4 py-3 text-left">Prédiction</th>
            </tr>
          </thead>
          <tbody>
            {matchesWithLogos.map(match => {
              const isBlue = match.teamBlue.id === team.id;
              const opponent = isBlue ? match.teamRed : match.teamBlue;
              const result = match.result 
                ? (isBlue 
                    ? (match.result.winner === team.id ? 'Victoire' : 'Défaite')
                    : (match.result.winner === team.id ? 'Victoire' : 'Défaite'))
                : '-';
              const predictionAccurate = match.result 
                ? match.predictedWinner === match.result.winner 
                : null;
              
              return (
                <tr key={match.id} className="border-t border-gray-100 hover:bg-gray-50">
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
                        {match.predictedWinner === team.id ? 'Victoire' : 'Défaite'} 
                        ({isBlue 
                          ? Math.round(match.blueWinOdds * 100)
                          : Math.round(match.redWinOdds * 100)}%)
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default TeamRecentMatches;
