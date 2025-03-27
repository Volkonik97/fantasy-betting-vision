
import React from "react";

interface SubRegionFilterProps {
  selectedSubRegion: string;
  setSelectedSubRegion: (subRegion: string) => void;
  subRegions: string[];
}

const SubRegionFilter = ({ 
  selectedSubRegion, 
  setSelectedSubRegion, 
  subRegions 
}: SubRegionFilterProps) => {
  return (
    <div className="w-full md:w-auto">
      <h3 className="font-medium mb-2">Filter by Sub-Region</h3>
      <div className="flex flex-wrap gap-2">
        {subRegions.map(subRegion => (
          <button
            key={subRegion}
            onClick={() => setSelectedSubRegion(subRegion)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              selectedSubRegion === subRegion
                ? "bg-lol-blue text-white"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            {subRegion}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SubRegionFilter;
