
import React from "react";
import { motion } from "framer-motion";

export interface SideAnalysisProps {
  statistics: {
    blueWins: number;
    redWins: number;
    blueFirstBlood: number;
    redFirstBlood: number;
    blueFirstDragon: number;
    redFirstDragon: number;
    blueFirstHerald: number;
    redFirstHerald: number;
    blueFirstTower: number;
    redFirstTower: number;
  };
}

const SideAnalysis = ({ statistics }: SideAnalysisProps) => {
  const compareStats = [
    {
      name: "Win Rate",
      blue: statistics.blueWins,
      red: statistics.redWins,
    },
    {
      name: "First Blood",
      blue: statistics.blueFirstBlood,
      red: statistics.redFirstBlood,
    },
    {
      name: "First Dragon",
      blue: statistics.blueFirstDragon,
      red: statistics.redFirstDragon,
    },
    {
      name: "First Herald",
      blue: statistics.blueFirstHerald,
      red: statistics.redFirstHerald,
    },
    {
      name: "First Tower",
      blue: statistics.blueFirstTower,
      red: statistics.redFirstTower,
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-subtle p-4 h-full">
      <h3 className="text-lg font-medium mb-6">Blue vs Red Side Analysis</h3>
      
      <div className="space-y-5">
        {compareStats.map((stat, index) => (
          <div key={stat.name}>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium text-lol-blue">{stat.blue}%</span>
              <span className="text-gray-500">{stat.name}</span>
              <span className="font-medium text-lol-red">{stat.red}%</span>
            </div>
            
            <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="absolute top-0 bottom-0 left-0 bg-lol-blue rounded-l-full"
                style={{ right: `${100 - stat.blue}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${stat.blue}%` }}
                transition={{ duration: 1, delay: index * 0.1 }}
              />
              
              <motion.div
                className="absolute top-0 bottom-0 right-0 bg-lol-red rounded-r-full"
                style={{ left: `${stat.blue}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${100 - stat.blue}%` }}
                transition={{ duration: 1, delay: index * 0.1 }}
              />
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium mb-3">Key Insights</h4>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <div className="w-4 h-4 mt-0.5 rounded-full bg-lol-blue/20 flex items-center justify-center flex-shrink-0">
              <div className="w-2 h-2 rounded-full bg-lol-blue" />
            </div>
            <span>Blue side has higher first objective control rates</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-4 h-4 mt-0.5 rounded-full bg-lol-red/20 flex items-center justify-center flex-shrink-0">
              <div className="w-2 h-2 rounded-full bg-lol-red" />
            </div>
            <span>Red side has counter-pick advantage in draft phase</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-4 h-4 mt-0.5 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
              <div className="w-2 h-2 rounded-full bg-gray-500" />
            </div>
            <span>Blue side tends to win faster games (avg: 28 min)</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SideAnalysis;
