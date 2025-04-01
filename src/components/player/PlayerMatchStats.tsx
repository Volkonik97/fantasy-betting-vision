
import React, { useEffect, useState } from "react";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { fetchEnhancedMatchStats } from "@/utils/player/matchDataFetcher";
import MatchErrorDisplay from "./match-stats/MatchErrorDisplay";
import MatchStatsTable from "./match-stats/MatchStatsTable";
import LoadingIndicator from "./match-stats/LoadingIndicator";

interface PlayerMatchStatsProps {
  matchStats: any[];
  isWinForPlayer: (stat: any) => boolean;
}

const PlayerMatchStats = ({ matchStats, isWinForPlayer }: PlayerMatchStatsProps) => {
  const [enhancedStats, setEnhancedStats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [matchErrors, setMatchErrors] = useState<Record<string, string>>({});
  
  useEffect(() => {
    let isMounted = true;
    
    const loadMatchDetails = async () => {
      if (matchStats.length === 0) {
        setEnhancedStats([]);
        return;
      }
      
      setIsLoading(true);
      
      try {
        const { enhancedStats: processedStats, errors } = await fetchEnhancedMatchStats(
          matchStats,
          isWinForPlayer
        );
        
        if (isMounted) {
          setEnhancedStats(processedStats);
          setMatchErrors(errors);
        }
      } catch (error) {
        console.error("Error enhancing match stats:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    loadMatchDetails();
    
    return () => {
      isMounted = false;
    };
  }, [matchStats, isWinForPlayer]);
  
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
      
      <MatchErrorDisplay errors={matchErrors} />
      
      {isLoading ? (
        <LoadingIndicator />
      ) : (
        <MatchStatsTable 
          matchStats={enhancedStats} 
          isWinForPlayer={isWinForPlayer} 
        />
      )}
    </div>
  );
};

export default PlayerMatchStats;
