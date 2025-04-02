
import React from "react";
import { normalizeRoleName } from "@/utils/leagueData/assembler/modelConverter";
import { Axe, Swords, Target, Heart, ShieldCheck } from "lucide-react";

interface PlayerRoleFilterProps {
  selectedRole: string;
  setSelectedRole: (role: string) => void;
  roles: string[];
}

const PlayerRoleFilter = ({ selectedRole, setSelectedRole, roles }: PlayerRoleFilterProps) => {
  // Display names for the roles (these will be shown in the UI)
  const roleDisplayNames: Record<string, string> = {
    "All": "All",
    "Top": "Top",
    "Jungle": "Jng",
    "Mid": "Mid",
    "ADC": "Bot", 
    "Support": "Sup"
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

  return (
    <div className="w-full md:w-auto">
      <h3 className="font-medium mb-2">Filter by Role</h3>
      <div className="flex flex-wrap gap-2">
        {roles.map(role => {
          // Normalize the role for comparison and internal use
          const normalizedRole = role === "All" ? "All" : normalizeRoleName(role);
          // Get the display name for the UI
          const displayName = role === "All" ? "All" : roleDisplayNames[normalizedRole] || normalizedRole;
          // Get the icon for this role
          const icon = getRoleIcon(normalizedRole);
          
          return (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center ${
                selectedRole === role
                  ? "bg-lol-blue text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
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
