
import React from "react";
import PlayerRoleFilter from "./PlayerRoleFilter";
import RegionCategoryFilter from "./RegionCategoryFilter";
import RegionFilter from "./RegionFilter";
import SubRegionFilter from "./SubRegionFilter";

interface PlayerFiltersProps {
  selectedRole: string;
  setSelectedRole: (role: string) => void;
  selectedCategory: string;
  handleCategorySelect: (category: string) => void;
  selectedRegion: string;
  handleRegionSelect: (region: string) => void;
  selectedSubRegion: string;
  setSelectedSubRegion: (subRegion: string) => void;
  roles: string[];
  regionCategories: Record<string, string[]>;
  subRegions: Record<string, string[]>;
}

const PlayerFilters = ({
  selectedRole,
  setSelectedRole,
  selectedCategory,
  handleCategorySelect,
  selectedRegion,
  handleRegionSelect,
  selectedSubRegion,
  setSelectedSubRegion,
  roles,
  regionCategories,
  subRegions
}: PlayerFiltersProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-6 mb-8">
      <PlayerRoleFilter 
        selectedRole={selectedRole} 
        setSelectedRole={setSelectedRole} 
        roles={roles} 
      />
      
      <RegionCategoryFilter 
        selectedCategory={selectedCategory} 
        handleCategorySelect={handleCategorySelect} 
        regionCategories={regionCategories} 
      />
      
      {selectedCategory !== "All" && (
        <RegionFilter 
          selectedRegion={selectedRegion} 
          handleRegionSelect={handleRegionSelect} 
          regions={regionCategories[selectedCategory]}
          categoryName={selectedCategory}
        />
      )}
      
      {selectedRegion === "LTA" && (
        <SubRegionFilter 
          selectedSubRegion={selectedSubRegion} 
          setSelectedSubRegion={setSelectedSubRegion} 
          subRegions={subRegions.LTA} 
        />
      )}
    </div>
  );
};

export default PlayerFilters;
