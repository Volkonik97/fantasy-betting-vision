
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
    const loadMatchesWithDetails = async () => {
      if (matchStats.length === 0) {
        setMatchesWithOpponents([]);
        return;
      }
      
      setIsLoading(true);
      
      try {
        console.log(`Chargement des détails pour ${matchStats.length} matchs...`);
        
        // Parcourir toutes les statistiques de match pour récupérer les données complètes
        const enhancedStats = await Promise.all(
          matchStats.map(async (stat) => {
            try {
              // Récupérer les données complètes du match à partir de son ID
              console.log(`Récupération des données pour le match ${stat.match_id}`);
              const matchData = await getMatchById(stat.match_id);
              
              if (!matchData) {
                console.warn(`Aucune donnée trouvée pour le match ${stat.match_id}`);
                return { ...stat, match_date: null, parsedDate: null };
              }
              
              // Déterminer l'équipe adverse
              const isBlueTeam = stat.team_id === matchData.teamBlue.id;
              const opponentTeam = isBlueTeam ? matchData.teamRed : matchData.teamBlue;
              
              // Extraire et analyser la date du match
              const matchDate = matchData.date;
              console.log(`Match ${stat.match_id} date: ${matchDate}`);
              
              let parsedDate = null;
              try {
                if (matchDate) {
                  parsedDate = new Date(matchDate);
                  if (isNaN(parsedDate.getTime())) {
                    console.warn(`Format de date invalide pour ${stat.match_id}: ${matchDate}`);
                    parsedDate = null;
                  } else {
                    console.log(`Date analysée avec succès pour ${stat.match_id}: ${parsedDate.toISOString()}`);
                  }
                }
              } catch (dateError) {
                console.error(`Erreur d'analyse de la date pour ${stat.match_id}:`, dateError);
              }
              
              return {
                ...stat,
                opponent_team_name: opponentTeam.name,
                opponent_team_id: opponentTeam.id,
                match_date: matchDate,
                parsedDate: parsedDate
              };
            } catch (error) {
              console.error(`Erreur lors du traitement du match ${stat.match_id}:`, error);
              return { ...stat, match_date: null, parsedDate: null };
            }
          })
        );
        
        // Journaliser les résultats pour le débogage
        if (enhancedStats.length > 0) {
          console.log("Premier match enrichi:", enhancedStats[0]);
          if (enhancedStats[0].match_date) {
            console.log("Date brute:", enhancedStats[0].match_date);
            console.log("Date analysée:", enhancedStats[0].parsedDate);
          }
        }
        
        // Trier les matchs par date (du plus récent au plus ancien)
        const sortedMatches = [...enhancedStats].sort((a, b) => {
          // Placer les matchs sans date valide à la fin
          if (!a.parsedDate) return 1;
          if (!b.parsedDate) return -1;
          
          // Trier par ordre décroissant de date
          return b.parsedDate.getTime() - a.parsedDate.getTime();
        });
        
        console.log("Tri des matchs effectué:", sortedMatches.length, "matchs triés");
        console.log("3 premiers matchs après tri:", sortedMatches.slice(0, 3).map(m => ({
          match_id: m.match_id,
          date: m.match_date,
          parsed: m.parsedDate ? m.parsedDate.toISOString() : 'N/A'
        })));
        
        setMatchesWithOpponents(sortedMatches);
      } catch (error) {
        console.error("Erreur lors du chargement des données des matchs:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadMatchesWithDetails();
  }, [matchStats]);

  // Utiliser les données enrichies si disponibles, sinon utiliser les données brutes
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
                // Utiliser directement le champ is_winner lorsqu'il est disponible
                const isWin = typeof stat.is_winner === 'boolean' ? stat.is_winner : isWinForPlayer(stat);
                
                return (
                  <TableRow key={stat.id || stat.match_id} className={isWin ? "bg-green-50/30" : "bg-red-50/30"}>
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
                      <div className="text-xs text-gray-500">
                        {stat.side || "N/A"}
                        {stat.match_date && (
                          <span className="ml-2">
                            {stat.parsedDate 
                              ? stat.parsedDate.toLocaleDateString() 
                              : stat.match_date.substring(0, 10)}
                          </span>
                        )}
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
