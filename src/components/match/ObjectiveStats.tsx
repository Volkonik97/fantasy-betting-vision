
import React from "react";
import { Card } from "@/components/ui/card";

interface ObjectiveStatsProps {
  teamName: string;
  opponentName: string;
  teamStats: any;
  opponentStats: any;
}

const ObjectiveStats = ({ teamName, opponentName, teamStats, opponentStats }: ObjectiveStatsProps) => {
  // Default values if stats are missing
  const getStatValue = (stats: any, key: string, defaultValue = 0): number => {
    if (!stats) return defaultValue;
    return stats[key] || defaultValue;
  };

  // Create objective stats
  const objectives = [
    {
      name: "First Blood",
      teamRate: getStatValue(teamStats, "firstBloodRate", 0.5) * 100,
      opponentRate: getStatValue(opponentStats, "firstBloodRate", 0.5) * 100,
    },
    {
      name: "First Dragon",
      teamRate: getStatValue(teamStats, "firstDragonRate", 0.5) * 100,
      opponentRate: getStatValue(opponentStats, "firstDragonRate", 0.5) * 100,
    },
    {
      name: "First Herald",
      teamRate: getStatValue(teamStats, "firstHeraldRate", 0.5) * 100,
      opponentRate: getStatValue(opponentStats, "firstHeraldRate", 0.5) * 100,
    },
    {
      name: "First Tower",
      teamRate: getStatValue(teamStats, "firstTowerRate", 0.5) * 100,
      opponentRate: getStatValue(opponentStats, "firstTowerRate", 0.5) * 100,
    },
    {
      name: "First Baron",
      teamRate: getStatValue(teamStats, "firstBaronRate", 0.5) * 100,
      opponentRate: getStatValue(opponentStats, "firstBaronRate", 0.5) * 100,
    },
  ];

  return (
    <div className="space-y-4">
      {objectives.map((objective) => (
        <Card key={objective.name} className="p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-md font-medium">{objective.name}</h3>
            <div className="text-sm text-gray-500">Win Rate</div>
          </div>
          <div className="relative h-7 bg-gray-100 rounded-full overflow-hidden">
            <div className="flex h-full">
              <div 
                className="bg-blue-500 flex items-center justify-end pr-2 text-xs text-white font-medium"
                style={{ width: `${objective.teamRate}%` }}
              >
                {objective.teamRate.toFixed(1)}%
              </div>
              <div 
                className="bg-red-500 flex items-center justify-start pl-2 text-xs text-white font-medium"
                style={{ width: `${objective.opponentRate}%` }}
              >
                {objective.opponentRate.toFixed(1)}%
              </div>
            </div>
          </div>
          <div className="flex justify-between mt-1 text-xs text-gray-500">
            <span>{teamName}</span>
            <span>{opponentName}</span>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ObjectiveStats;
