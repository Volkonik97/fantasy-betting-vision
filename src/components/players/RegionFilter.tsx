
import React from "react";

interface RegionFilterProps {
  selectedRegion: string;
  handleRegionSelect: (region: string) => void;
  regions: string[];
  categoryName: string;
}

const RegionFilter = ({ 
  selectedRegion, 
  handleRegionSelect, 
  regions,
  categoryName
}: RegionFilterProps) => {
  return (
    <div className="w-full md:w-auto">
      <h3 className="font-medium mb-2">Filter by {categoryName} Region</h3>
      <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto">
        {regions.map(region => (
          <button
            key={region}
            onClick={() => handleRegionSelect(region)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
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

export default RegionFilter;
