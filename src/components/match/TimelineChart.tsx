
import React, { useState } from "react";
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TimelineStats } from "@/utils/models/types";

interface TimelineChartProps {
  teamName: string;
  opponentName: string;
  teamTimelineStats: TimelineStats;
  opponentTimelineStats: TimelineStats;
}

const TimelineChart = ({ teamName, opponentName, teamTimelineStats, opponentTimelineStats }: TimelineChartProps) => {
  const [stat, setStat] = useState<'gold' | 'cs' | 'xp'>('gold');

  // Merge timeline stats into chart data
  const chartData = Object.keys(teamTimelineStats).map(time => {
    const teamStats = teamTimelineStats[time];
    const opponentStats = opponentTimelineStats[time];

    return {
      name: `${time} min`,
      [`${teamName} Gold`]: teamStats.avgGold,
      [`${opponentName} Gold`]: opponentStats?.avgGold || 0,
      [`${teamName} CS`]: teamStats.avgCs,
      [`${opponentName} CS`]: opponentStats?.avgCs || 0,
      [`${teamName} XP`]: teamStats.avgXp,
      [`${opponentName} XP`]: opponentStats?.avgXp || 0,
    };
  }).sort((a, b) => parseInt(a.name) - parseInt(b.name));

  const getStatKeys = (): { team: string, opponent: string } => {
    switch (stat) {
      case 'cs':
        return {
          team: `${teamName} CS`,
          opponent: `${opponentName} CS`
        };
      case 'xp':
        return {
          team: `${teamName} XP`,
          opponent: `${opponentName} XP`
        };
      default:
        return {
          team: `${teamName} Gold`,
          opponent: `${opponentName} Gold`
        };
    }
  };

  const { team: teamKey, opponent: opponentKey } = getStatKeys();

  return (
    <div className="space-y-4">
      <div className="flex justify-center space-x-4">
        <button
          className={`px-4 py-2 rounded-lg ${stat === 'gold' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setStat('gold')}
        >
          Gold
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${stat === 'cs' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setStat('cs')}
        >
          CS
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${stat === 'xp' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setStat('xp')}
        >
          XP
        </button>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip 
            formatter={(value: any) => {
              // Fix: Type checking for value before using toFixed
              if (typeof value === 'number') {
                return value.toFixed(0);
              }
              return value;
            }}
          />
          <Legend />
          <Area type="monotone" dataKey={teamKey} stackId="1" stroke="#8884d8" fill="#8884d8" />
          <Area type="monotone" dataKey={opponentKey} stackId="2" stroke="#82ca9d" fill="#82ca9d" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TimelineChart;
