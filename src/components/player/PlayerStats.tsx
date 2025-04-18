
import React from "react";

interface PlayerStatsProps {
  kda: number;
  csPerMin: number;
  killParticipation: number;
}

const PlayerStats = ({ kda, csPerMin, killParticipation }: PlayerStatsProps) => {
  // Format KDA to 2 decimal places
  const formattedKDA = typeof kda === 'number' ? kda.toFixed(2) : '0.00';
  
  // Format CS/Min to 1 decimal place
  const formattedCSPerMin = typeof csPerMin === 'number' ? csPerMin.toFixed(1) : '0.0';
  
  // Handle the KP value formatting with better debugging
  console.log(`Original killParticipation value: ${killParticipation}, type: ${typeof killParticipation}`);
  
  // Parse the value to a number if it's a string, default to 0 if null/undefined
  const kpNumericValue = typeof killParticipation === 'number' 
    ? killParticipation 
    : parseFloat(String(killParticipation || '0'));
  
  console.log(`After parsing: kpNumericValue: ${kpNumericValue}, type: ${typeof kpNumericValue}`);
  
  // Format KP as percentage
  // If the value is already in percentage form (e.g., 65 for 65%), display as is
  // If the value is in decimal form (e.g., 0.65 for 65%), multiply by 100
  const formattedKP = isNaN(kpNumericValue) 
    ? '0.0%' 
    : `${kpNumericValue > 1 ? kpNumericValue.toFixed(1) : (kpNumericValue * 100).toFixed(1)}%`;
  
  console.log(`Formatted KP: ${formattedKP}`);
  
  return (
    <div className="grid grid-cols-3 gap-2 mt-3 text-center text-xs border-t pt-3 border-gray-100">
      <div>
        <p className="text-gray-500">KDA</p>
        <p className="font-semibold">{formattedKDA}</p>
      </div>
      <div>
        <p className="text-gray-500">CS/Min</p>
        <p className="font-semibold">{formattedCSPerMin}</p>
      </div>
      <div>
        <p className="text-gray-500">KP%</p>
        <p className="font-semibold">{formattedKP}</p>
      </div>
    </div>
  );
};

export default PlayerStats;
