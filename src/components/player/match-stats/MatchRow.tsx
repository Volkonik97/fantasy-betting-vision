
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Link } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface MatchRowProps {
  stat: any;
  isWin: boolean;
}

const MatchRow: React.FC<MatchRowProps> = ({ stat, isWin }) => {
  const formattedDate = stat.matchDate ? stat.matchDate.toLocaleDateString() : '';
  const tournamentInfo = stat.tournament ? stat.tournament.substring(0, 20) : '';
  
  return (
    <TableRow className={isWin ? "bg-green-50/30" : "bg-red-50/30"}>
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
          {tournamentInfo && <span className="ml-2 opacity-75 hidden sm:inline">({tournamentInfo})</span>}
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
};

export default MatchRow;
