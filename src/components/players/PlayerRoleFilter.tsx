
import React from "react";
import { Axe, Swords, Target, Heart, ShieldCheck } from "lucide-react";
import { getRoleColor, getRoleDisplayName } from "../player/RoleBadge";
import { normalizeRoleName } from "@/utils/leagueData/assembler/modelConverter";

interface PlayerRoleFilterProps {
  selectedRole: string;
  setSelectedRole: (role: string) => void;
  roles: string[];
}

const PlayerRoleFilter = ({ selectedRole, setSelectedRole, roles }: PlayerRoleFilterProps) => {
  // Icons for each role
  const getRoleIcon = (role: string) => {
    const normalizedRole = normalizeRoleName(role);
    
    if (role === "All") return null;
    
    switch (normalizedRole) {
      case "Top": return <Axe className="h-4 w-4 mr-1.5" />;
      case "Jungle": return <Swords className="h-4 w-4 mr-1.5" />;
      case "Mid": return <Target className="h-4 w-4 mr-1.5" />;
      case "ADC": return <Axe className="h-4 w-4 mr-1.5" />;
      case "Support": return <Heart className="h-4 w-4 mr-1.5" />;
      default: return <ShieldCheck className="h-4 w-4 mr-1.5" />;
    }
  };

  // Generate role background style with opacity for the filter buttons
  const getRoleFilterStyle = (role: string, isSelected: boolean) => {
    if (role === "All") {
      return isSelected ? "bg-lol-blue text-white" : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200";
    }
    
    const normalizedRole = normalizeRoleName(role);
    
    if (isSelected) {
      return `${getRoleColor(normalizedRole)} text-white`;
    } else {
      switch (normalizedRole) {
        case "Top": return "bg-white text-red-600 hover:bg-red-50 border border-red-200";
        case "Jungle": return "bg-white text-green-600 hover:bg-green-50 border border-green-200";
        case "Mid": return "bg-white text-yellow-600 hover:bg-yellow-50 border border-yellow-200";
        case "ADC": return "bg-white text-blue-600 hover:bg-blue-50 border border-blue-200";
        case "Support": return "bg-white text-purple-600 hover:bg-purple-50 border border-purple-200";
        default: return "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200";
      }
    }
  };

  return (
    <div className="w-full md:w-auto">
      <h3 className="font-medium mb-2">Filter by Role</h3>
      <div className="flex flex-wrap gap-2">
        {roles.map(role => {
          const displayName = role === "All" ? "All" : getRoleDisplayName(role);
          const icon = getRoleIcon(role);
          const isSelected = selectedRole === role;
          
          return (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center ${
                getRoleFilterStyle(role, isSelected)
              }`}
              data-role-value={role}
            >
              {icon}
              {displayName}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PlayerRoleFilter;
