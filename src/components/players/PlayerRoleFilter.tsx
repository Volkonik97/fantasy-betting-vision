
import React from "react";
import { normalizeRoleName } from "@/utils/leagueData/assembler/modelConverter";
import { Axe, Swords, Target, Heart, ShieldCheck } from "lucide-react";

interface PlayerRoleFilterProps {
  selectedRole: string;
  setSelectedRole: (role: string) => void;
  roles: string[];
}

const PlayerRoleFilter = ({ selectedRole, setSelectedRole, roles }: PlayerRoleFilterProps) => {
  // Display names for the roles
  const roleDisplayNames: Record<string, string> = {
    "All": "All",
    "Top": "Top",
    "Jungle": "Jungle", 
    "Mid": "Mid",
    "ADC": "Bot",
    "Support": "Support"
  };
  
  // Icons for each role
  const getRoleIcon = (role: string) => {
    switch (role) {
      case "All": return null;
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
    
    if (isSelected) {
      switch (role.toLowerCase()) {
        case "top": return "bg-gradient-to-r from-red-600 to-red-500 text-white";
        case "jungle": return "bg-gradient-to-r from-green-600 to-green-500 text-white";
        case "mid": return "bg-gradient-to-r from-yellow-500 to-yellow-400 text-white";
        case "adc": return "bg-gradient-to-r from-blue-600 to-blue-500 text-white";
        case "support": return "bg-gradient-to-r from-purple-600 to-purple-500 text-white";
        default: return "bg-gradient-to-r from-gray-500 to-gray-400 text-white";
      }
    } else {
      switch (role.toLowerCase()) {
        case "top": return "bg-white text-red-600 hover:bg-red-50 border border-red-200";
        case "jungle": return "bg-white text-green-600 hover:bg-green-50 border border-green-200";
        case "mid": return "bg-white text-yellow-600 hover:bg-yellow-50 border border-yellow-200";
        case "adc": return "bg-white text-blue-600 hover:bg-blue-50 border border-blue-200";
        case "support": return "bg-white text-purple-600 hover:bg-purple-50 border border-purple-200";
        default: return "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200";
      }
    }
  };

  return (
    <div className="w-full md:w-auto">
      <h3 className="font-medium mb-2">Filter by Role</h3>
      <div className="flex flex-wrap gap-2">
        {roles.map(role => {
          const normalizedRole = role === "All" ? "All" : normalizeRoleName(role);
          const displayName = role === "All" ? "All" : roleDisplayNames[normalizedRole] || normalizedRole;
          const icon = getRoleIcon(normalizedRole);
          const isSelected = selectedRole === role;
          
          return (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center ${
                getRoleFilterStyle(normalizedRole, isSelected)
              }`}
              data-role-value={normalizedRole}
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
