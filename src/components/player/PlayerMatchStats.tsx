
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
  const [enhancedStats, setEnhancedStats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const fetchMatchDetails = async () => {
      if (matchStats.length === 0) {
        setEnhancedStats([]);
        return;
      }
      
      setIsLoading(true);
      
      try {
        console.log(`Chargement des détails pour ${matchStats.length} matchs...`);
        
        // Récupérer les détails des matchs un par un
        const matchesWithDetails = [];
        
        for (const stat of matchStats) {
          try {
            // Récupérer les données du match
            const matchData = await getMatchById(stat.match_id);
            
            if (!matchData) {
              console.warn(`Aucune donnée trouvée pour le match ${stat.match_id}`);
              matchesWithDetails.push({
                ...stat,
                matchDate: null
              });
              continue;
            }
            
            // Déterminer l'équipe adverse
            const isBlueTeam = stat.team_id === matchData.teamBlue.id;
            const opponentTeam = isBlueTeam ? matchData.teamRed : matchData.teamBlue;
            
            // Ajouter les informations au stat
            matchesWithDetails.push({
              ...stat,
              opponentTeamName: opponentTeam.name,
              opponentTeamId: opponentTeam.id,
              matchDate: matchData.date ? new Date(matchData.date) : null
            });
            
          } catch (error) {
            console.error(`Erreur lors du traitement du match ${stat.match_id}:`, error);
            matchesWithDetails.push({
              ...stat,
              matchDate: null
            });
          }
        }
        
        // Trier les matchs par date (du plus récent au plus ancien)
        const sortedMatches = matchesWithDetails.sort((a, b) => {
          // Si une date est manquante, la placer à la fin
          if (!a.matchDate) return 1;
          if (!b.matchDate) return -1;
          
          // Trier du plus récent au plus ancien
          return b.matchDate.getTime() - a.matchDate.getTime();
        });
        
        console.log(`Matchs triés: ${sortedMatches.length} matchs`);
        setEnhancedStats(sortedMatches);
      } catch (error) {
        console.error("Erreur lors du chargement des détails des matchs:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMatchDetails();
  }, [matchStats]);
  
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-subtle p-6">
      <h2 className="text-xl font-bold mb-4">
        Statistiques par match ({enhancedStats.length} matchs)
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="ml-2 text-gray-400 hover:text-gray-600">
                <Info size={16} />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm max-w-xs">
                Les matchs sont triés du plus récent au plus ancien.
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
      ) : enhancedStats.length > 0 ? (
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
              {enhancedStats.map((stat) => {
                // Utiliser directement le champ is_winner lorsqu'il est disponible
                const isWin = typeof stat.is_winner === 'boolean' ? stat.is_winner : isWinForPlayer(stat);
                const formattedDate = stat.matchDate ? stat.matchDate.toLocaleDateString() : '';
                
                return (
                  <TableRow key={stat.id || stat.match_id} className={isWin ? "bg-green-50/30" : "bg-red-50/30"}>
                    <TableCell className="font-medium">
                      {stat.opponentTeamName ? (
                        <Link to={`/matches/${stat.match_id}`} className="text-lol-blue hover:underline">
                          {stat.opponentTeamName}
                        </Link>
                      ) : (
                        <Link to={`/matches/${stat.match_id}`} className="text-lol-blue hover:underline">
                          {stat.match_id ? stat.match_id.substring(0, 8) + "..." : "N/A"}
                        </Link>
                      )}
                      <div className="text-xs text-gray-500">
                        {stat.side || "N/A"}
                        {formattedDate && <span className="ml-2">{formattedDate}</span>}
                      </div>
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
