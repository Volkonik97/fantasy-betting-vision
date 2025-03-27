
import React from "react";

interface PlayerRoleFilterProps {
  selectedRole: string;
  setSelectedRole: (role: string) => void;
  roles: string[];
}

const PlayerRoleFilter = ({ selectedRole, setSelectedRole, roles }: PlayerRoleFilterProps) => {
  // Store the display name and the value separately to ensure consistent comparison
  const roleMapping: Record<string, string> = {
    "All": "All",
    "Top": "Top",
    "Jungle": "Jungle",
    "Mid": "Mid",
    "ADC": "ADC", 
    "Support": "Support"
  };

  // Use this function to normalize role values for comparison
  const normalizeRoleValue = (role: string): string => {
    if (role.toLowerCase() === "jungle" || role.toLowerCase() === "jgl" || role.toLowerCase() === "jg") {
      return "Jungle";
    }
    return roleMapping[role] || role;
  };

  return (
    <div className="w-full md:w-auto">
      <h3 className="font-medium mb-2">Filter by Role</h3>
      <div className="flex flex-wrap gap-2">
        {roles.map(role => (
          <button
            key={role}
            onClick={() => setSelectedRole(role)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              selectedRole === role
                ? "bg-lol-blue text-white"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
            }`}
            data-role-value={normalizeRoleValue(role)}
          >
            {role}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PlayerRoleFilter;
