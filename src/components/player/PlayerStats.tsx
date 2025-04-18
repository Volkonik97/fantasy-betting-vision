
import React from "react";

interface PlayerStatsProps {
  kda: number | string;
  csPerMin: number | string;
  damageShare: number | string;
}

const PlayerStats: React.FC<PlayerStatsProps> = ({ kda, csPerMin, damageShare }) => {
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

  // Format damage share value with detailed console logs
  const formatDamageShareValue = (value: number | string): string => {
    console.log(`PlayerStats: processing damageShare:`, value, typeof value);
    
    if (value === null || value === undefined) {
      console.log('PlayerStats: damageShare is null or undefined');
      return '0%';
    }
    
    try {
      // Convert to string for safe processing
      const valueAsString = String(value).trim();
      console.log('PlayerStats: damageShare as string:', valueAsString);
      
      // If empty string, return 0%
      if (!valueAsString) {
        console.log('PlayerStats: damageShare is empty string');
        return '0%';
      }
      
      // Remove any percentage sign if present
      const cleanedValue = valueAsString.replace(/%/g, '');
      console.log('PlayerStats: cleaned damageShare:', cleanedValue);
      
      // Convert to number
      const numericValue = parseFloat(cleanedValue);
      
      // Check if valid number
      if (isNaN(numericValue)) {
        console.log('PlayerStats: damageShare is not a valid number:', valueAsString);
        return '0%';
      }
      
      // Handle values between 0 and 1 as decimal percentages (convert to 0-100 range)
      let finalValue = numericValue;
      if (numericValue > 0 && numericValue < 1) {
        finalValue = numericValue * 100;
        console.log('PlayerStats: converted decimal to percentage:', finalValue);
      }
      
      // Round to whole number and format
      const formattedValue = `${Math.round(finalValue)}%`;
      console.log('PlayerStats: final formatted damageShare:', formattedValue);
      return formattedValue;
    } catch (error) {
      console.error('Error formatting damage share:', error);
      return '0%';
    }
  };

  return (
    <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-3 gap-2 text-center">
      <div>
        <p className="font-semibold">{formatKdaValue(kda)}</p>
        <p className="text-xs text-gray-500">KDA</p>
      </div>
      <div>
        <p className="font-semibold">{formatCsPerMinValue(csPerMin)}</p>
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
