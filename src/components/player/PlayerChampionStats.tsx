
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ChampionStat {
  champion: string;
  games: number;
  wins: number;
  kills: number;
  deaths: number;
  assists: number;
}

interface PlayerChampionStatsProps {
  championStats: ChampionStat[];
}

const PlayerChampionStats = ({ championStats }: PlayerChampionStatsProps) => {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-subtle p-6">
      <h2 className="text-xl font-bold mb-4">Statistiques par champion</h2>
      
      {championStats.length > 0 ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Champion</TableHead>
                <TableHead>Parties</TableHead>
                <TableHead>Victoires</TableHead>
                <TableHead>KDA</TableHead>
                <TableHead>K/D/A</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {championStats.map((champ) => {
                const kda = champ.deaths > 0 
                  ? ((champ.kills + champ.assists) / champ.deaths) 
                  : champ.kills + champ.assists;
                
                const winRatePercent = Math.round((champ.wins / champ.games) * 100);
                const winRateColor = winRatePercent >= 60 
                  ? "text-green-600" 
                  : winRatePercent >= 50 
                    ? "text-blue-600" 
                    : "text-red-600";
                
                return (
                  <TableRow key={champ.champion}>
                    <TableCell className="font-medium">{champ.champion}</TableCell>
                    <TableCell>{champ.games}</TableCell>
                    <TableCell>
                      <span className={winRateColor}>
                        {champ.wins} ({winRatePercent}%)
                      </span>
                    </TableCell>
                    <TableCell>{kda.toFixed(2)}</TableCell>
                    <TableCell>
                      {(champ.kills / champ.games).toFixed(1)} / {(champ.deaths / champ.games).toFixed(1)} / {(champ.assists / champ.games).toFixed(1)}
                    </TableCell>
                  </TableRow>
                );
              })}
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
