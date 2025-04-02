
import React from "react";
import { Badge } from "@/components/ui/badge";

interface PlayerRoleFilterProps {
  selectedRole: string;
  setSelectedRole: (role: string) => void;
  roles: string[];
}

const PlayerRoleFilter = ({ selectedRole, setSelectedRole, roles }: PlayerRoleFilterProps) => {
  // Map of roles to their respective colors for visual distinction
  const roleColors: Record<string, string> = {
    All: "bg-gray-600",
    Top: "bg-red-600",
    Jungle: "bg-green-600",
    Mid: "bg-blue-600", 
    ADC: "bg-amber-600",
    Support: "bg-purple-600"
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
                ? `${roleColors[role] || "bg-gray-600"} text-white`
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            {role}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PlayerRoleFilter;
