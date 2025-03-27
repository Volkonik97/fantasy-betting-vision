
import React from "react";

interface PlayerAverageStats {
  kills: number;
  deaths: number;
  assists: number;
  kda: number;
  csPerMin: number;
  damageShare: number;
  visionScore: number;
  goldShare: number;
  games: number;
  wins: number;
  winRate: number;
}

interface PlayerStatsOverviewProps {
  averageStats: PlayerAverageStats | null;
}

const PlayerStatsOverview = ({ averageStats }: PlayerStatsOverviewProps) => {
  if (!averageStats) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-subtle p-6">
        <h2 className="text-xl font-bold mb-4">Statistiques générales</h2>
        <p className="text-gray-500 text-center py-6">Aucune statistique de match disponible</p>
      </div>
    );
  }

  // Calculate the actual total values for display
  const totalKills = averageStats.kills * averageStats.games;
  const totalDeaths = averageStats.deaths * averageStats.games;
  const totalAssists = averageStats.assists * averageStats.games;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-subtle p-6">
      <h2 className="text-xl font-bold mb-4">Statistiques générales</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm text-gray-500 mb-2">KDA</h3>
          <div className="flex justify-between items-baseline">
            <span className="text-2xl font-bold">{averageStats.kda.toFixed(2)}</span>
            <span className="text-sm text-gray-600">
              {averageStats.kills.toFixed(1)} / {averageStats.deaths.toFixed(1)} / {averageStats.assists.toFixed(1)}
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Total: {Math.round(totalKills)} / {Math.round(totalDeaths)} / {Math.round(totalAssists)}
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm text-gray-500 mb-2">CS par minute</h3>
          <div className="flex justify-between items-baseline">
            <span className="text-2xl font-bold">{averageStats.csPerMin.toFixed(1)}</span>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm text-gray-500 mb-2">Part des dégâts</h3>
          <div className="flex justify-between items-baseline">
            <span className="text-2xl font-bold">{Math.round(averageStats.damageShare * 100)}%</span>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm text-gray-500 mb-2">Win Rate</h3>
          <div className="flex justify-between items-baseline">
            <span className="text-2xl font-bold">{Math.round(averageStats.winRate)}%</span>
            <span className="text-sm text-gray-600">
              {averageStats.wins} / {averageStats.games}
            </span>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm text-gray-500 mb-2">Vision Score</h3>
          <div className="flex justify-between items-baseline">
            <span className="text-2xl font-bold">{Math.round(averageStats.visionScore || 0)}</span>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm text-gray-500 mb-2">Part de l'or</h3>
          <div className="flex justify-between items-baseline">
            <span className="text-2xl font-bold">{Math.round(averageStats.goldShare * 100)}%</span>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm text-gray-500 mb-2">Matchs joués</h3>
          <div className="flex justify-between items-baseline">
            <span className="text-2xl font-bold">{averageStats.games}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerStatsOverview;
