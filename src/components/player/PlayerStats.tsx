
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
  
  // More detailed debugging for killParticipation value
  console.log(`PlayerStats: Raw killParticipation value: ${killParticipation}, type: ${typeof killParticipation}`);
  
  // Format KP as percentage with consistent handling
  let formattedKP = '0.0%';
  
  if (killParticipation !== undefined && killParticipation !== null) {
    // Always treat as percentage value directly (already in the correct range of 0-100)
    // No need to check if it's decimal or percentage format
    formattedKP = `${Number(killParticipation).toFixed(1)}%`;
    console.log(`PlayerStats: Formatted KP directly to ${formattedKP} from ${killParticipation}`);
  }
  
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
