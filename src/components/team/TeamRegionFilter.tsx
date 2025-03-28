
import React from "react";

interface TeamRegionFilterProps {
  regions: string[];
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  regionCategories: Record<string, string[]>;
}

const TeamRegionFilter: React.FC<TeamRegionFilterProps> = ({ 
  regions, 
  selectedRegion, 
  setSelectedRegion,
  selectedCategory,
  setSelectedCategory,
  regionCategories
}) => {
  return (
    <div className="mb-8">
      <h3 className="font-medium mb-2">Filter by Region Category</h3>
      <div className="flex flex-wrap gap-3 mb-4">
        {Object.keys(regionCategories).map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedCategory === category
                ? "bg-lol-blue text-white"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            {category}
          </button>
        ))}
      </div>
      
      {selectedCategory !== "All" && (
        <>
          <h3 className="font-medium mb-2">Filter by Region</h3>
          <div className="flex flex-wrap gap-3">
            {regionCategories[selectedCategory].map(region => (
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
        </>
      )}
    </div>
  );
};

export default TeamRegionFilter;
