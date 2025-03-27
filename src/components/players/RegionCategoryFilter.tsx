
import React from "react";

interface RegionCategoryFilterProps {
  selectedCategory: string;
  handleCategorySelect: (category: string) => void;
  regionCategories: Record<string, string[]>;
}

const RegionCategoryFilter = ({ 
  selectedCategory, 
  handleCategorySelect, 
  regionCategories 
}: RegionCategoryFilterProps) => {
  return (
    <div className="w-full md:w-auto">
      <h3 className="font-medium mb-2">Filter by Region Category</h3>
      <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto">
        {Object.keys(regionCategories).map(category => (
          <button
            key={category}
            onClick={() => handleCategorySelect(category)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              selectedCategory === category
                ? "bg-lol-blue text-white"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};

export default RegionCategoryFilter;
