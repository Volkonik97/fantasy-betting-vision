
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Award, BarChart, Pie, TrendingUp, Compass } from "lucide-react";

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

  // Calculate the actual total values for display
  const totalKills = averageStats.kills * averageStats.games;
  const totalDeaths = averageStats.deaths * averageStats.games;
  const totalAssists = averageStats.assists * averageStats.games;

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
          {/* KDA Card */}
          <StatCard
            icon={<TrendingUp className="h-5 w-5 text-emerald-500" />}
            title="KDA"
            value={averageStats.kda.toFixed(2)}
            subtitle={`${averageStats.kills.toFixed(1)} / ${averageStats.deaths.toFixed(1)} / ${averageStats.assists.toFixed(1)}`}
            footer={`Total: ${Math.round(totalKills)} / ${Math.round(totalDeaths)} / ${Math.round(totalAssists)}`}
          />
          
          {/* CS per minute Card */}
          <StatCard
            icon={<Pie className="h-5 w-5 text-amber-500" />}
            title="CS par minute"
            value={averageStats.csPerMin.toFixed(1)}
          />
          
          {/* Damage Share Card */}
          <StatCard
            icon={<BarChart className="h-5 w-5 text-rose-500" />}
            title="Part des dégâts"
            value={`${Math.round(averageStats.damageShare * 100)}%`}
          />
          
          {/* Win Rate Card */}
          <StatCard
            icon={<Award className="h-5 w-5 text-lol-blue" />}
            title="Win Rate"
            value={`${Math.round(averageStats.winRate)}%`}
            subtitle={`${averageStats.wins} / ${averageStats.games}`}
            footer={
              <div className="flex items-center gap-3 text-xs mt-1">
                <span className="inline-flex items-center text-green-600">
                  <CheckCircle size={12} className="mr-1" />
                  {averageStats.wins}
                </span>
                <span className="inline-flex items-center text-red-600">
                  <XCircle size={12} className="mr-1" />
                  {averageStats.games - averageStats.wins}
                </span>
              </div>
            }
          />
          
          {/* Vision Score Card */}
          <StatCard
            icon={<Compass className="h-5 w-5 text-indigo-500" />}
            title="Vision Score"
            value={Math.round(averageStats.visionScore || 0).toString()}
          />
          
          {/* Gold Share Card */}
          <StatCard
            icon={<Award className="h-5 w-5 text-yellow-500" />}
            title="Part de l'or"
            value={`${Math.round(averageStats.goldShare * 100)}%`}
          />
          
          {/* Matches Played Card */}
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

interface StatCardProps {
  icon?: React.ReactNode;
  title: string;
  value: string;
  subtitle?: string;
  footer?: React.ReactNode | string;
  isWide?: boolean;
}

const StatCard = ({ icon, title, value, subtitle, footer, isWide = false }: StatCardProps) => {
  return (
    <div className={`bg-gray-50 p-4 rounded-lg border border-gray-100 hover:shadow-md transition-all ${isWide ? 'col-span-2' : ''}`}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <h3 className="text-sm text-gray-500">{title}</h3>
      </div>
      <div className="flex justify-between items-baseline">
        <span className="text-2xl font-bold">{value}</span>
        {subtitle && <span className="text-sm text-gray-600">{subtitle}</span>}
      </div>
      {footer && <div className="text-xs text-gray-500 mt-1">{footer}</div>}
    </div>
  );
};

export default PlayerStatsOverview;
