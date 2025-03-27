
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import MatchRow from "./MatchRow";

interface MatchStatsTableProps {
  matchStats: any[];
  isWinForPlayer: (stat: any) => boolean;
}

const MatchStatsTable: React.FC<MatchStatsTableProps> = ({ matchStats, isWinForPlayer }) => {
  if (matchStats.length === 0) {
    return (
      <p className="text-gray-500 text-center py-6">Aucune statistique de match disponible</p>
    );
  }

  return (
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
          {matchStats.map((stat) => {
            // Utiliser directement le champ is_winner lorsqu'il est disponible
            const isWin = typeof stat.is_winner === 'boolean' ? stat.is_winner : isWinForPlayer(stat);
            return (
              <MatchRow
                key={stat.id || stat.match_id}
                stat={stat}
                isWin={isWin}
              />
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default MatchStatsTable;
