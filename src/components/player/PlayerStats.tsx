
import React from "react";

interface PlayerStatsProps {
  kda: number | string;
  csPerMin: number | string;
}

const PlayerStats: React.FC<PlayerStatsProps> = ({ kda, csPerMin }) => {
  // Format KDA value (kills, deaths, assists ratio)
  const formatKdaValue = (value: number | string): string => {
    if (value === null || value === undefined) return '0.0';
    
    try {
      const numericValue = typeof value === 'number' 
        ? value 
        : parseFloat(String(value).trim());
      
      if (isNaN(numericValue)) return '0.0';
      return numericValue.toFixed(1);
    } catch (error) {
      console.error('Error formatting KDA:', error);
      return '0.0';
    }
  };
  
  // Format CS per minute value
  const formatCsPerMinValue = (value: number | string): string => {
    if (value === null || value === undefined) return '0.0';
    
    try {
      const numericValue = typeof value === 'number' 
        ? value 
        : parseFloat(String(value).trim());
      
      if (isNaN(numericValue)) return '0.0';
      return numericValue.toFixed(1);
    } catch (error) {
      console.error('Error formatting CS/min:', error);
      return '0.0';
    }
  };

  return (
    <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-center">
      <div>
        <p className="font-semibold">{formatKdaValue(kda)}</p>
        <p className="text-xs text-gray-500">KDA</p>
      </div>
      <div>
        <p className="font-semibold">{formatCsPerMinValue(csPerMin)}</p>
        <p className="text-xs text-gray-500">CS/min</p>
      </div>
    </div>
  );
};

export default PlayerStats;
