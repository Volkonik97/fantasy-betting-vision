
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
  const [matchErrors, setMatchErrors] = useState<Record<string, string>>({});
  
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
        const errorsByMatchId: Record<string, string> = {};
        
        for (const stat of matchStats) {
          try {
            // Récupérer les données du match
            const matchData = await getMatchById(stat.match_id);
            
            if (!matchData) {
              console.warn(`Aucune donnée trouvée pour le match ${stat.match_id}`);
              errorsByMatchId[stat.match_id] = "Match non trouvé dans la base de données";
              
              matchesWithDetails.push({
                ...stat,
                matchDate: null,
                matchError: "Match non trouvé"
              });
              continue;
            }
            
            // Déterminer l'équipe adverse
            const isBlueTeam = stat.team_id === matchData.teamBlue.id;
            const opponentTeam = isBlueTeam ? matchData.teamRed : matchData.teamBlue;
            
            // Formater la date si elle existe
            let formattedDate = null;
            if (matchData.date) {
              try {
                const dateObj = new Date(matchData.date);
                if (!isNaN(dateObj.getTime())) {
                  formattedDate = dateObj;
                } else {
                  console.warn(`Format de date invalide pour le match ${stat.match_id}: ${matchData.date}`);
                  errorsByMatchId[stat.match_id] = `Format de date invalide: ${matchData.date}`;
                }
              } catch (dateError) {
                console.warn(`Erreur de parsing de date pour le match ${stat.match_id}:`, dateError);
                errorsByMatchId[stat.match_id] = "Erreur de conversion de date";
              }
            } else {
              console.warn(`Date manquante pour le match ${stat.match_id}`);
              errorsByMatchId[stat.match_id] = "Date manquante dans les données du match";
            }
            
            // Ajouter les informations au stat
            matchesWithDetails.push({
              ...stat,
              opponentTeamName: opponentTeam.name,
              opponentTeamId: opponentTeam.id,
              matchDate: formattedDate
            });
            
          } catch (error) {
            console.error(`Erreur lors du traitement du match ${stat.match_id}:`, error);
            errorsByMatchId[stat.match_id] = `Erreur: ${error}`;
            matchesWithDetails.push({
              ...stat,
              matchDate: null,
              matchError: `Erreur lors du traitement: ${error}`
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
        
        // Vérifier les erreurs survenues pendant le chargement
        if (Object.keys(errorsByMatchId).length > 0) {
          console.warn("Erreurs de chargement pour certains matchs:", errorsByMatchId);
          setMatchErrors(errorsByMatchId);
        }
        
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
      
      {Object.keys(matchErrors).length > 0 && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
          <p className="text-amber-700 text-sm font-medium">
            Certains matchs n'ont pas pu être correctement chargés. Vérifiez que tous les matchs existent dans la base de données.
          </p>
          <details className="mt-1">
            <summary className="text-xs text-amber-600 cursor-pointer">
              Voir les détails ({Object.keys(matchErrors).length} erreurs)
            </summary>
            <div className="mt-2 text-xs text-amber-800 max-h-40 overflow-y-auto">
              <ul className="list-disc pl-5">
                {Object.entries(matchErrors).map(([matchId, error]) => (
                  <li key={matchId}>
                    Match {matchId}: {error}
                  </li>
                ))}
              </ul>
            </div>
          </details>
        </div>
      )}
      
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
                          {stat.matchError && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <span className="ml-1 text-amber-500 text-xs">!</span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs">Erreur: {stat.matchError}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
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
