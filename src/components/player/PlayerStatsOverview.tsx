
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Award, BarChart, PieChart, TrendingUp, Compass, Eye } from "lucide-react";

interface PlayerAverageStats {
  kills: number;
  deaths: number;
  assists: number;
  kda: number;
  csPerMin: number;
  damageShare: number;
  visionScore: number;
  wardsCleared: number;
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
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center">
            <Award className="mr-2 h-5 w-5 text-lol-blue" />
            Statistiques générales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-6">Aucune statistique de match disponible</p>
        </CardContent>
      </Card>
    );
  }

  const totalKills = averageStats.kills * averageStats.games;
  const totalDeaths = averageStats.deaths * averageStats.games;
  const totalAssists = averageStats.assists * averageStats.games;

  const formatDamageShare = (value: number): string => {
    if (isNaN(value) || value === 0) return "0%";
    
    if (value >= 0 && value <= 1) {
      return `${Math.round(value * 100)}%`;
    }
    
    return `${Math.round(value)}%`;
  };

  const formatGoldShare = (value: number): string => {
    if (isNaN(value) || value === 0) return "0%";
    
    if (value >= 0 && value <= 1) {
      return `${Math.round(value * 100)}%`;
    }
    
    return `${Math.round(value)}%`;
  };

  console.log(`PlayerStatsOverview damageShare:`, averageStats.damageShare, 
    `formatted as: ${formatDamageShare(averageStats.damageShare)}`);
    
  console.log(`PlayerStatsOverview goldShare:`, averageStats.goldShare, 
    `formatted as: ${formatGoldShare(averageStats.goldShare)}`);
  
  console.log(`PlayerStatsOverview games:`, averageStats.games,
    `wins:`, averageStats.wins,
    `winRate:`, averageStats.winRate);

  return (
    <Card className="shadow-md bg-white">
      <CardHeader className="border-b border-gray-100 pb-4">
        <CardTitle className="text-xl font-bold flex items-center">
          <Award className="mr-2 h-5 w-5 text-lol-blue" />
          Statistiques générales
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={<TrendingUp className="h-5 w-5 text-emerald-500" />}
            title="KDA"
            value={averageStats.kda.toFixed(2)}
            footer={
              <div className="mt-3 flex flex-col space-y-1">
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 mr-1.5"></span>
                    <span className="text-xs font-medium">Kills</span>
                  </div>
                  <span className="text-xs font-bold">{averageStats.kills.toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <span className="w-3 h-3 rounded-full bg-rose-500 mr-1.5"></span>
                    <span className="text-xs font-medium">Deaths</span>
                  </div>
                  <span className="text-xs font-bold">{averageStats.deaths.toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <span className="w-3 h-3 rounded-full bg-blue-500 mr-1.5"></span>
                    <span className="text-xs font-medium">Assists</span>
                  </div>
                  <span className="text-xs font-bold">{averageStats.assists.toFixed(1)}</span>
                </div>
                <div className="mt-1 pt-1 border-t border-gray-100 text-xs text-gray-500">
                  Total: {Math.round(totalKills)} / {Math.round(totalDeaths)} / {Math.round(totalAssists)}
                </div>
              </div>
            }
          />
          
          <StatCard
            icon={<PieChart className="h-5 w-5 text-amber-500" />}
            title="CS par minute"
            value={averageStats.csPerMin.toFixed(1)}
          />
          
          <StatCard
            icon={<BarChart className="h-5 w-5 text-rose-500" />}
            title="Part des dégâts"
            value={formatDamageShare(averageStats.damageShare)}
          />
          
          <StatCard
            icon={<Award className="h-5 w-5 text-lol-blue" />}
            title="Win Rate"
            value={`${Math.round(averageStats.winRate)}%`}
            footer={
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium">Victoires / Défaites</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-green-600">{averageStats.wins}</span>
                    <span className="text-xs">-</span>
                    <span className="text-xs font-bold text-red-600">{averageStats.games - averageStats.wins}</span>
                  </div>
                </div>
                
                <div className="relative pt-1">
                  <div className="flex mb-1.5 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block py-0.5 px-1.5 uppercase rounded-sm bg-green-200 text-green-900">
                        {Math.round(averageStats.winRate)}%
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-medium inline-block text-gray-600">
                        {averageStats.games} matchs
                      </span>
                    </div>
                  </div>
                  
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-red-100">
                    <div
                      style={{ width: `${averageStats.winRate}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-green-400 to-green-600"
                    ></div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-1.5 text-xs">
                    <span className="inline-flex items-center text-green-600">
                      <CheckCircle size={12} className="mr-1" />
                      Victoires
                    </span>
                    <span className="inline-flex items-center text-red-600">
                      <XCircle size={12} className="mr-1" />
                      Défaites
                    </span>
                  </div>
                </div>
              </div>
            }
          />
          
          <StatCard
            icon={<Eye className="h-5 w-5 text-indigo-500" />}
            title="Vision Score par min"
            value={averageStats.visionScore.toFixed(1)}
            footer={
              <div className="mt-2 pt-1 border-t border-gray-100">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Wards détruites par min:</span>
                  <span className="font-semibold">{averageStats.wardsCleared.toFixed(1)}</span>
                </div>
              </div>
            }
          />
          
          <StatCard
            icon={<Award className="h-5 w-5 text-yellow-500" />}
            title="Part de l'or"
            value={formatGoldShare(averageStats.goldShare)}
          />
          
          <StatCard
            title="Matchs joués"
            value={averageStats.games.toString()}
            isWide={true}
          />
        </div>
      </CardContent>
    </Card>
  );
};

const StatCard = ({ icon, title, value, subtitle, footer, isWide = false }: StatCardProps) => {
  return (
    <div className={`bg-gradient-to-br from-white to-gray-50 p-4 rounded-lg border border-gray-100 hover:shadow-md transition-all ${isWide ? 'col-span-2' : ''}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
      </div>
      <div className="flex justify-between items-baseline">
        <span className="text-2xl font-bold text-gray-800">{value}</span>
        {subtitle && <span className="text-sm text-gray-600">{subtitle}</span>}
      </div>
      {footer && <div className="text-xs text-gray-500 mt-2">{footer}</div>}
    </div>
  );
};

interface StatCardProps {
  icon?: React.ReactNode;
  title: string;
  value: string;
  subtitle?: string;
  footer?: React.ReactNode | string;
  isWide?: boolean;
}

export default PlayerStatsOverview;
