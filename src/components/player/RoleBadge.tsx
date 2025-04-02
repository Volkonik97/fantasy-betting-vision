
import React from "react";
import { normalizeRoleName } from "@/utils/leagueData/assembler/modelConverter";

interface RoleBadgeProps {
  role: string;
}

export const getRoleColor = (role: string) => {
  // Normalize the role first for consistency
  const normalizedRole = normalizeRoleName(role);
  
  switch (normalizedRole) {
    case "Top": return "bg-gradient-to-r from-red-600 to-red-500";
    case "Jungle": return "bg-gradient-to-r from-green-600 to-green-500";
    case "Mid": return "bg-gradient-to-r from-yellow-500 to-yellow-400";
    case "ADC": return "bg-gradient-to-r from-blue-600 to-blue-500";
    case "Support": return "bg-gradient-to-r from-purple-600 to-purple-500";
    default: return "bg-gradient-to-r from-gray-500 to-gray-400";
  }
};

export const getRoleDisplayName = (role: string): string => {
  // Normalize the role first for consistency
  const normalizedRole = normalizeRoleName(role);
  
  switch (normalizedRole) {
    case "Top": return "Top";
    case "Jungle": return "Jungle";
    case "Mid": return "Mid";
    case "ADC": return "Bot";
    case "Support": return "Support";
    default: return role;
  }
};

export const getRoleIconPath = (role: string): string => {
  // Remove all image references - they're causing errors
  return "";
};

const RoleBadge: React.FC<RoleBadgeProps> = ({ role }) => {
  const normalizedRole = normalizeRoleName(role);
  
  return (
    <div className={`absolute bottom-0 left-0 right-0 h-8 ${getRoleColor(normalizedRole)} flex items-center justify-center shadow-md`}>
      <div className="flex items-center text-white font-medium">
        <span>{getRoleDisplayName(normalizedRole)}</span>
      </div>
    </div>
  );
};

export default RoleBadge;
