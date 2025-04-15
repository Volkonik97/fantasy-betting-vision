
import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, Legend } from 'recharts';
import { ShieldCheck, Sword, BarChart2, Clock, TrendingUp, Target, Award } from "lucide-react";

interface PlayerStatsOverviewProps {
  averageStats: any;
}

const PlayerStatsOverview = ({ averageStats }: PlayerStatsOverviewProps) => {
  // Fallback if no stats are provided
  if (!averageStats) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-subtle p-6">
        <h2 className="text-xl font-bold mb-4">Statistiques d'ensemble</h2>
        <p className="text-gray-500">Aucune statistique disponible pour ce joueur.</p>
      </div>
    );
  }
  
  // Convert percentage values to display format (multiply by 100, add % sign)
  const formatPercent = (value: number) => {
    // Log the value for debugging
    console.log(`PlayerStatsOverview formatting percent:`, value);
    return `${Math.round(value)}%`;
  };
  
  // Format damage share for display
  const displayDamageShare = averageStats.damageShare ? 
    formatPercent(averageStats.damageShare * 100) : 
    '0%';
  console.log(`PlayerStatsOverview damageShare: ${averageStats.damageShare} formatted as: ${displayDamageShare}`);
  
  // Format gold share for display
  const displayGoldShare = averageStats.goldShare ? 
    formatPercent(averageStats.goldShare) : 
    '0%';
  console.log(`PlayerStatsOverview goldShare: ${averageStats.goldShare} formatted as: ${displayGoldShare}`);

  // Format win rate for display
  console.log(`PlayerStatsOverview games: ${averageStats.games} wins: ${averageStats.wins} winRate: ${averageStats.winRate}`);
  const displayWinRate = averageStats.winRate !== undefined ? 
    formatPercent(averageStats.winRate) : 
    'N/A';
    
  // Format kill participation for display
  const displayKillParticipation = averageStats.killParticipation !== undefined ? 
    `${averageStats.killParticipation.toFixed(1)}%` : 
    'N/A';
  console.log(`PlayerStatsOverview killParticipation: ${averageStats.killParticipation} formatted as: ${displayKillParticipation}`);
  
  // Format dmg per gold (ensure we display it with sufficient decimal places)
  const rawDmgPerGold = averageStats.dmgPerGold;
  console.log(`PlayerStatsOverview dmgPerGold: ${rawDmgPerGold} raw value type: ${typeof rawDmgPerGold}`);
  const displayDmgPerGold = rawDmgPerGold !== undefined ? 
    rawDmgPerGold.toFixed(3) : 
    'N/A';
  console.log(`PlayerStatsOverview dmgPerGold: ${rawDmgPerGold} formatted as: ${displayDmgPerGold}`);
  
  // Generate KDA stats for chart
  const kdaData = [
    { name: 'Kills', value: averageStats.kills || 0 },
    { name: 'Deaths', value: averageStats.deaths || 0 },
    { name: 'Assists', value: averageStats.assists || 0 },
  ];
  
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-subtle p-6">
      <h2 className="text-xl font-bold mb-4">Statistiques d'ensemble</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* KDA Section */}
        <div className="rounded-lg border border-gray-100 shadow-sm p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold flex items-center gap-2">
              <Sword size={16} className="text-lol-blue" />
              KDA
            </h3>
            <span className="text-xl font-bold">{averageStats.kda ? averageStats.kda.toFixed(2) : '0.00'}</span>
          </div>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={kdaData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3182CE">
                  <Cell fill="#4299E1" /> {/* Kills */}
                  <Cell fill="#F56565" /> {/* Deaths */}
                  <Cell fill="#68D391" /> {/* Assists */}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2 text-center text-sm">
            <div>
              <p className="text-gray-500">Kills</p>
              <p className="font-bold text-blue-500">{averageStats.kills ? averageStats.kills.toFixed(1) : '0.0'}</p>
            </div>
            <div>
              <p className="text-gray-500">Deaths</p>
              <p className="font-bold text-red-500">{averageStats.deaths ? averageStats.deaths.toFixed(1) : '0.0'}</p>
            </div>
            <div>
              <p className="text-gray-500">Assists</p>
              <p className="font-bold text-green-500">{averageStats.assists ? averageStats.assists.toFixed(1) : '0.0'}</p>
            </div>
          </div>
        </div>
        
        {/* Performance Metrics */}
        <div className="rounded-lg border border-gray-100 shadow-sm p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold flex items-center gap-2">
              <BarChart2 size={16} className="text-lol-blue" />
              Performance
            </h3>
          </div>
          <div className="space-y-3 mt-4">
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">CS/Min</span>
                <span className="font-bold">{averageStats.csPerMin ? averageStats.csPerMin.toFixed(1) : '0.0'}</span>
              </div>
              <div className="bg-gray-200 h-2 rounded-full mt-1">
                <div 
                  className="bg-lol-blue h-2 rounded-full" 
                  style={{ width: `${Math.min(100, (averageStats.csPerMin || 0) * 10)}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Dégâts/Min</span>
                <span className="font-bold">{averageStats.dpm ? Math.round(averageStats.dpm) : '0'}</span>
              </div>
              <div className="bg-gray-200 h-2 rounded-full mt-1">
                <div 
                  className="bg-lol-blue h-2 rounded-full" 
                  style={{ width: `${Math.min(100, (averageStats.dpm || 0) / 60)}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">DMG/Gold</span>
                <span className="font-bold">{displayDmgPerGold}</span>
              </div>
              <div className="bg-gray-200 h-2 rounded-full mt-1">
                <div 
                  className="bg-lol-blue h-2 rounded-full" 
                  style={{ width: `${Math.min(100, (averageStats.dmgPerGold || 0) * 2000)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Team Contribution */}
        <div className="rounded-lg border border-gray-100 shadow-sm p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold flex items-center gap-2">
              <ShieldCheck size={16} className="text-lol-blue" />
              Contribution
            </h3>
          </div>
          <div className="space-y-3 mt-4">
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Part de dégâts</span>
                <span className="font-bold">{displayDamageShare}</span>
              </div>
              <div className="bg-gray-200 h-2 rounded-full mt-1">
                <div 
                  className="bg-lol-blue h-2 rounded-full" 
                  style={{ width: `${Math.min(100, averageStats.damageShare ? averageStats.damageShare * 100 : 0)}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Part d'or</span>
                <span className="font-bold">{displayGoldShare}</span>
              </div>
              <div className="bg-gray-200 h-2 rounded-full mt-1">
                <div 
                  className="bg-lol-blue h-2 rounded-full" 
                  style={{ width: `${Math.min(100, averageStats.goldShare || 0)}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Participation aux kills</span>
                <span className="font-bold">{displayKillParticipation}</span>
              </div>
              <div className="bg-gray-200 h-2 rounded-full mt-1">
                <div 
                  className="bg-lol-blue h-2 rounded-full" 
                  style={{ width: `${Math.min(100, averageStats.killParticipation || 0)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Vision Control */}
        <div className="rounded-lg border border-gray-100 shadow-sm p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold flex items-center gap-2">
              <Target size={16} className="text-lol-blue" />
              Vision
            </h3>
          </div>
          <div className="space-y-3 mt-4">
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Score Vision/Min</span>
                <span className="font-bold">{averageStats.visionScore ? averageStats.visionScore.toFixed(2) : '0.00'}</span>
              </div>
              <div className="bg-gray-200 h-2 rounded-full mt-1">
                <div 
                  className="bg-lol-blue h-2 rounded-full" 
                  style={{ width: `${Math.min(100, (averageStats.visionScore || 0) * 10)}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Wards éliminés/Min</span>
                <span className="font-bold">{averageStats.wardsCleared ? averageStats.wardsCleared.toFixed(2) : '0.00'}</span>
              </div>
              <div className="bg-gray-200 h-2 rounded-full mt-1">
                <div 
                  className="bg-lol-blue h-2 rounded-full" 
                  style={{ width: `${Math.min(100, (averageStats.wardsCleared || 0) * 25)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Game Stats */}
        <div className="rounded-lg border border-gray-100 shadow-sm p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold flex items-center gap-2">
              <Clock size={16} className="text-lol-blue" />
              Matchs
            </h3>
          </div>
          <div className="space-y-3 mt-4">
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Matchs joués</span>
                <span className="font-bold">{averageStats.games || 0}</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Victoires</span>
                <span className="font-bold">{averageStats.wins || 0}</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Taux de victoire</span>
                <span className="font-bold">{displayWinRate}</span>
              </div>
              <div className="bg-gray-200 h-2 rounded-full mt-1">
                <div 
                  className="bg-lol-blue h-2 rounded-full" 
                  style={{ width: `${Math.min(100, averageStats.winRate || 0)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Performance Scores */}
        <div className="rounded-lg border border-gray-100 shadow-sm p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold flex items-center gap-2">
              <Award size={16} className="text-lol-blue" />
              Scores
            </h3>
          </div>
          <div className="space-y-3 mt-4">
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Early Game</span>
                <span className="font-bold">{averageStats.earlyGame ? averageStats.earlyGame.toFixed(1) : '0.0'}</span>
              </div>
              <div className="bg-gray-200 h-2 rounded-full mt-1">
                <div 
                  className="bg-lol-blue h-2 rounded-full" 
                  style={{ width: `${Math.min(100, averageStats.earlyGame || 0)}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Aggression</span>
                <span className="font-bold">{averageStats.aggression ? averageStats.aggression.toFixed(1) : '0.0'}</span>
              </div>
              <div className="bg-gray-200 h-2 rounded-full mt-1">
                <div 
                  className="bg-lol-blue h-2 rounded-full" 
                  style={{ width: `${Math.min(100, averageStats.aggression || 0)}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Efficacité</span>
                <span className="font-bold">{averageStats.efficiency ? averageStats.efficiency.toFixed(1) : '0.0'}</span>
              </div>
              <div className="bg-gray-200 h-2 rounded-full mt-1">
                <div 
                  className="bg-lol-blue h-2 rounded-full" 
                  style={{ width: `${Math.min(100, averageStats.efficiency || 0)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerStatsOverview;
