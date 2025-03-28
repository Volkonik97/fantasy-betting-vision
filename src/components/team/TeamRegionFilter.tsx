
import React from "react";

interface TeamRegionFilterProps {
  regions: string[];
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;
}

const TeamRegionFilter: React.FC<TeamRegionFilterProps> = ({ 
  regions, 
  selectedRegion, 
  setSelectedRegion 
}) => {
  return (
    <div className="mb-8">
      <div className="flex flex-wrap gap-3">
        {regions.map(region => (
          <button
            key={region}
            onClick={() => setSelectedRegion(region)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedRegion === region
                ? "bg-lol-blue text-white"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            {region}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TeamRegionFilter;
