
import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { getMatchById } from "@/utils/database/matchesService";

interface PlayerMatchStatsProps {
  matchStats: any[];
  isWinForPlayer: (stat: any) => boolean;
}

const PlayerMatchStats = ({ matchStats, isWinForPlayer }: PlayerMatchStatsProps) => {
  const [matchesWithOpponents, setMatchesWithOpponents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const loadOpponentTeams = async () => {
      setIsLoading(true);
      
      try {
        const statsWithOpponents = await Promise.all(
          matchStats.map(async (stat) => {
            try {
              const match = await getMatchById(stat.match_id);
              
              // If match isn't found, just return the original stat
              if (!match) return stat;
              
              // Determine opponent team based on the player's team_id
              const isBlueTeam = stat.team_id === match.teamBlue.id;
              const opponentTeam = isBlueTeam ? match.teamRed : match.teamBlue;
              
              return {
                ...stat,
                opponent_team_name: opponentTeam.name,
                opponent_team_id: opponentTeam.id
              };
            } catch (error) {
              console.error(`Error loading match data for ${stat.match_id}:`, error);
              return stat;
            }
          })
        );
        
        // Log the first result to debug
        if (statsWithOpponents.length > 0) {
          console.log("First match with opponent:", statsWithOpponents[0]);
        }
        
        setMatchesWithOpponents(statsWithOpponents);
      } catch (error) {
        console.error("Error loading opponent teams:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (matchStats.length > 0) {
      loadOpponentTeams();
    } else {
      setMatchesWithOpponents([]);
    }
  }, [matchStats]);

  const statsToDisplay = matchesWithOpponents.length > 0 ? matchesWithOpponents : matchStats;
  
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-subtle p-6">
      <h2 className="text-xl font-bold mb-4">
        Statistiques par match ({statsToDisplay.length} matchs)
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="ml-2 text-gray-400 hover:text-gray-600">
                <Info size={16} />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm max-w-xs">
                Les résultats sont déterminés en utilisant directement la colonne "result" 
                du fichier de données qui indique si l'équipe du joueur a gagné le match.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </h2>
      
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-lol-blue mx-auto"></div>
          <p className="mt-2 text-gray-500">Chargement des données...</p>
        </div>
      ) : statsToDisplay.length > 0 ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Adversaire</TableHead>
                <TableHead>Champion</TableHead>
                <TableHead>Résultat</TableHead>
                <TableHead>K/D/A</TableHead>
                <TableHead>CS/Min</TableHead>
                <TableHead>Vision</TableHead>
                <TableHead>Dégâts</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {statsToDisplay.map((stat) => {
                // Utilize the is_winner field directly when available
                const isWin = typeof stat.is_winner === 'boolean' ? stat.is_winner : isWinForPlayer(stat);
                
                return (
                  <TableRow key={stat.id} className={isWin ? "bg-green-50/30" : "bg-red-50/30"}>
                    <TableCell className="font-medium">
                      {stat.opponent_team_name ? (
                        <Link to={`/matches/${stat.match_id}`} className="text-lol-blue hover:underline">
                          {stat.opponent_team_name}
                        </Link>
                      ) : (
                        <Link to={`/matches/${stat.match_id}`} className="text-lol-blue hover:underline">
                          {stat.match_id ? stat.match_id.substring(0, 8) + "..." : "N/A"}
                        </Link>
                      )}
                      <div className="text-xs text-gray-500">{stat.side || "N/A"}</div>
                    </TableCell>
                    <TableCell>{stat.champion || "N/A"}</TableCell>
                    <TableCell>
                      <span className={isWin ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                        {isWin ? "Victoire" : "Défaite"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {stat.kills || 0}/{stat.deaths || 0}/{stat.assists || 0}
                    </TableCell>
                    <TableCell>{stat.cspm ? stat.cspm.toFixed(1) : "N/A"}</TableCell>
                    <TableCell>{stat.vision_score || "N/A"}</TableCell>
                    <TableCell>
                      {stat.damage_share ? `${Math.round(stat.damage_share * 100)}%` : "N/A"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <p className="text-gray-500 text-center py-6">Aucune statistique de match disponible</p>
      )}
    </div>
  );
};

export default PlayerMatchStats;
