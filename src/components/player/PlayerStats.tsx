
import React from "react";

interface PlayerStatsProps {
  kda: number | string;
  csPerMin: number | string;
  damageShare: number | string;
}

const PlayerStats: React.FC<PlayerStatsProps> = ({ kda, csPerMin, damageShare }) => {
  // Format the damage share value to ensure proper display
  const formatDamageShareValue = (value: number | string): string => {
    // Log for debugging the input value
    console.log(`PlayerStats: formatting damageShare:`, value, typeof value);
    
    if (value === null || value === undefined) {
      return '0%';
    }
    
    try {
      // Convert to string first for safe handling
      const valueAsString = String(value).trim();
      
      // Remove any percentage sign
      const cleanedValue = valueAsString.replace(/%/g, '');
      
      // Convert to float
      let numericValue = parseFloat(cleanedValue);
      
      // Check if valid number
      if (isNaN(numericValue)) {
        console.log('PlayerStats: invalid damageShare value:', valueAsString);
        return '0%';
      }
      
      // If it's a decimal between 0-1, convert to percentage
      if (numericValue > 0 && numericValue < 1) {
        numericValue = numericValue * 100;
        console.log(`PlayerStats: converted decimal ${value} to percentage: ${numericValue}%`);
      }
      
      // Round to nearest integer and return with % sign
      return `${Math.round(numericValue)}%`;
    } catch (error) {
      console.error('Error formatting damage share:', error);
      return '0%';
    }
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
        <p className="font-semibold">{formatDamageShareValue(damageShare)}</p>
        <p className="text-xs text-gray-500">DMG%</p>
      </div>
    </div>
  );
};

export default PlayerStats;
