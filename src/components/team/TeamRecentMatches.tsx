
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Team, Match } from "@/utils/models/types";
import { getTeamLogoUrl } from "@/utils/database/teams/logoUtils";
import TeamMatchesLoading from "./TeamMatchesLoading";
import TeamMatchesEmpty from "./TeamMatchesEmpty";
import TeamMatchesTable from "./TeamMatchesTable";

interface TeamRecentMatchesProps {
  team: Team | null;
  matches: Match[];
}

const TeamRecentMatches = ({ team, matches }: TeamRecentMatchesProps) => {
  const [matchesWithLogos, setMatchesWithLogos] = useState<Match[]>([]);
  const [isLoadingLogos, setIsLoadingLogos] = useState(true);

  useEffect(() => {
    if (!team) return;
    
    console.log(`Traitement de ${matches.length} matchs pour l'équipe ${team.id} (${team.name})`);
    
    const fetchLogos = async () => {
      setIsLoadingLogos(true);
      
      if (matches.length === 0) {
        setIsLoadingLogos(false);
        return;
      }
      
      try {
        // Sort matches by date (most recent first)
        const sortedMatches = [...matches].sort((a, b) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
        
        console.log(`Tri des matchs: ${sortedMatches.length} matchs après tri par date`);
        
        const updatedMatches = await Promise.all(
          sortedMatches.map(async (match) => {
            // Ensure the match is valid
            if (!match.teamBlue || !match.teamRed) {
              console.error(`Match invalide (${match.id}): données d'équipe manquantes`, match);
              return match;
            }
            
            // Determine opponent team
            const isBlue = match.teamBlue.id === team.id || match.teamBlue.name === team.name;
            const opponent = isBlue ? match.teamRed : match.teamBlue;
            
            if (!opponent || !opponent.id) {
              console.error(`Match ${match.id}: informations d'adversaire invalides`, opponent);
              return match;
            }
            
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
              console.error(`Erreur lors de la récupération du logo pour l'équipe ${opponent.id}:`, error);
            }
            
            // Return original match if logo fetch failed
            return match;
          })
        );
        
        console.log(`Traité ${updatedMatches.length} matchs avec logos`);
        setMatchesWithLogos(updatedMatches);
      } catch (error) {
        console.error("Erreur lors du traitement des matchs avec logos:", error);
      } finally {
        setIsLoadingLogos(false);
      }
    };
    
    fetchLogos();
  }, [matches, team]);

  if (isLoadingLogos || !team) {
    return <TeamMatchesLoading />;
  }

  if (matchesWithLogos.length === 0) {
    return <TeamMatchesEmpty />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
      className="mt-8"
    >
      <h2 className="text-2xl font-bold mb-4">Matchs récents ({matchesWithLogos.length})</h2>
      <div className="bg-white rounded-xl border border-gray-100 shadow-subtle overflow-hidden">
        <TeamMatchesTable 
          matches={matchesWithLogos} 
          teamId={team.id} 
          teamName={team.name} 
        />
      </div>
    </motion.div>
  );
};

export default TeamRecentMatches;
