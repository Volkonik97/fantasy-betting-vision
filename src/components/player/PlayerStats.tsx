
import React from "react";

interface PlayerStatsProps {
  kda: number | string;
  csPerMin: number | string;
  damageShare: number | string;
}

const PlayerStats: React.FC<PlayerStatsProps> = ({ kda, csPerMin, damageShare }) => {
  return (
    <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-3 gap-2 text-center">
      <div>
        <p className="font-semibold">{typeof kda === 'number' ? kda.toFixed(1) : kda}</p>
        <p className="text-xs text-gray-500">KDA</p>
      </div>
      <div>
        <p className="font-semibold">{typeof csPerMin === 'number' ? csPerMin.toFixed(1) : csPerMin}</p>
        <p className="text-xs text-gray-500">CS/min</p>
      </div>
      <div>
        <p className="font-semibold">
          {typeof damageShare === 'number' ? `${Math.round(damageShare * 100)}%` : damageShare}
        </p>
        <p className="text-xs text-gray-500">DMG%</p>
      </div>
    </div>
  );
};

export default PlayerStats;
