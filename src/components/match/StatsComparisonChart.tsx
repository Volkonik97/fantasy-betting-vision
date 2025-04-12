
import React from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface StatsComparisonChartProps {
  teamName: string;
  opponentName: string;
  teamStats: any;
  opponentStats: any;
}

const StatsComparisonChart = ({ teamName, opponentName, teamStats, opponentStats }: StatsComparisonChartProps) => {
  // Default values if stats are missing
  const getStatValue = (stats: any, key: string, defaultValue = 0): number => {
    if (!stats) return defaultValue;
    return stats[key] || defaultValue;
  };

  // Create comparison data for key stats
  const comparisonData = [
    {
      name: "Win Rate",
      [teamName]: getStatValue(teamStats, "winRate", 50) * 100,
      [opponentName]: getStatValue(opponentStats, "winRate", 50) * 100,
    },
    {
      name: "First Blood",
      [teamName]: getStatValue(teamStats, "firstBloodRate", 50) * 100,
      [opponentName]: getStatValue(opponentStats, "firstBloodRate", 50) * 100,
    },
    {
      name: "First Dragon",
      [teamName]: getStatValue(teamStats, "firstDragonRate", 50) * 100,
      [opponentName]: getStatValue(opponentStats, "firstDragonRate", 50) * 100,
    },
    {
      name: "First Herald",
      [teamName]: getStatValue(teamStats, "firstHeraldRate", 50) * 100,
      [opponentName]: getStatValue(opponentStats, "firstHeraldRate", 50) * 100,
    },
    {
      name: "First Tower",
      [teamName]: getStatValue(teamStats, "firstTowerRate", 50) * 100,
      [opponentName]: getStatValue(opponentStats, "firstTowerRate", 50) * 100,
    },
  ];

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={comparisonData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis unit="%" />
          <Tooltip 
            formatter={(value: number) => `${value.toFixed(1)}%`} 
          />
          <Legend />
          <Bar dataKey={teamName} fill="#3b82f6" />
          <Bar dataKey={opponentName} fill="#ef4444" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StatsComparisonChart;
