
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ChampionStat {
  champion: string;
  games: number;
  wins: number;
  winRate: number;
  kills: number;
  deaths: number;
  assists: number;
  kda: number | string;
}

interface PlayerChampionStatsProps {
  championStats: ChampionStat[];
}

const PlayerChampionStats = ({ championStats }: PlayerChampionStatsProps) => {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-subtle p-6">
      <h2 className="text-xl font-bold mb-4">Champions ({championStats.length} champions)</h2>
      
      {championStats.length > 0 ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Champion</TableHead>
                <TableHead>Parties</TableHead>
                <TableHead>Win Rate</TableHead>
                <TableHead>K/D/A</TableHead>
                <TableHead>KDA</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {championStats.map((stat) => (
                <TableRow key={stat.champion}>
                  <TableCell className="font-medium">{stat.champion}</TableCell>
                  <TableCell>
                    {stat.games}
                    <div className="text-xs text-gray-500">
                      {stat.wins}V - {stat.games - stat.wins}D
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500" 
                          style={{ width: `${stat.winRate}%` }}
                        />
                      </div>
                      <span className={stat.winRate >= 50 ? "text-blue-600" : "text-gray-600"}>
                        {Math.round(stat.winRate)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {(stat.kills / stat.games).toFixed(1)}/
                    {(stat.deaths / stat.games).toFixed(1)}/
                    {(stat.assists / stat.games).toFixed(1)}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">
                      {typeof stat.kda === 'number' ? stat.kda.toFixed(2) : stat.kda}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <p className="text-gray-500 text-center py-6">Aucune statistique de champion disponible</p>
      )}
    </div>
  );
};

export default PlayerChampionStats;
