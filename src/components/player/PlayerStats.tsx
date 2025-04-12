
import React from "react";

interface PlayerStatsProps {
  kda: number | string;
  csPerMin: number | string;
  damageShare: number | string;
}

const PlayerStats: React.FC<PlayerStatsProps> = ({ kda, csPerMin, damageShare }) => {
  // Format damage share percentage properly
  const formatDamageShare = (value: number | string) => {
    if (typeof value === 'number') {
      // If it's already between 0-1, multiply by 100
      if (value >= 0 && value <= 1) {
        return `${Math.round(value * 100)}%`;
      }
      // If it's already a percentage (likely between 0-100)
      return `${Math.round(value)}%`;
    }
    // Handle string values or fallback
    return value || '0%';
  };

  return (
    <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-3 gap-2 text-center">
      <div>
        <p className="font-semibold">{typeof kda === 'number' ? kda.toFixed(1) : kda || '0.0'}</p>
        <p className="text-xs text-gray-500">KDA</p>
      </div>
      <div>
        <p className="font-semibold">{typeof csPerMin === 'number' ? csPerMin.toFixed(1) : csPerMin || '0.0'}</p>
        <p className="text-xs text-gray-500">CS/min</p>
      </div>
      <div>
        <p className="font-semibold">
          {formatDamageShare(damageShare)}
        </p>
        <p className="text-xs text-gray-500">DMG%</p>
      </div>
    </div>
  );
};

export default PlayerStats;
