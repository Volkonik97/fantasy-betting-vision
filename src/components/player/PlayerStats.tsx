
import React from "react";

interface PlayerStatsProps {
  kda: number | string;
  csPerMin: number | string;
  damageShare: number | string;
}

const PlayerStats: React.FC<PlayerStatsProps> = ({ kda, csPerMin, damageShare }) => {
  // Format damage share percentage properly
  const formatDamageShare = (value: number | string) => {
    // Add debugging to trace the value
    console.log(`Formatting damageShare value:`, value, `of type:`, typeof value);
    
    // If value is NaN, undefined, null, or empty string, show '0%'
    if (value === undefined || value === null || value === '' || 
        (typeof value === 'number' && isNaN(value))) {
      return '0%';
    }
    
    // If it's a number, format it properly
    if (typeof value === 'number') {
      // Check if the value is already a percentage (0-100) or a decimal (0-1)
      if (value >= 0 && value <= 1) {
        // It's a decimal representing percentage (0.24 = 24%)
        return `${Math.round(value * 100)}%`;
      } else {
        // It's already a percentage value (24 = 24%)
        return `${Math.round(value)}%`;
      }
    }
    
    // If it's a string, try to parse it as a number
    if (typeof value === 'string') {
      // Remove any existing % sign if present
      const cleanValue = value.replace('%', '').trim();
      if (cleanValue === '') return '0%';
      
      // Try parsing as a number
      const numValue = parseFloat(cleanValue);
      if (!isNaN(numValue)) {
        if (numValue >= 0 && numValue <= 1) {
          return `${Math.round(numValue * 100)}%`;
        }
        return `${Math.round(numValue)}%`;
      }
    }
    
    // Default fallback
    return '0%';
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
        <p className="font-semibold">{formatDamageShare(damageShare)}</p>
        <p className="text-xs text-gray-500">DMG%</p>
      </div>
    </div>
  );
};

export default PlayerStats;
