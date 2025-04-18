
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
  
  // Format Kill Participation as percentage
  // First ensure it's a valid number, then format it
  const kpValue = typeof killParticipation === 'number' ? killParticipation : 0;
  
  // Format KP as percentage
  // If the value is already in percentage form (e.g., 65 for 65%), display as is
  // If the value is in decimal form (e.g., 0.65 for 65%), multiply by 100
  const formattedKP = `${kpValue > 1 ? kpValue.toFixed(1) : (kpValue * 100).toFixed(1)}%`;
  
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
