
import React from "react";

interface RoleBadgeProps {
  role: string;
}

export const getRoleColor = (role: string) => {
  switch (role) {
    case "Top": return "bg-gradient-to-r from-red-800 to-red-600";
    case "Jungle": return "bg-gradient-to-r from-green-600 to-green-400";
    case "Mid": return "bg-gradient-to-r from-orange-400 to-orange-300";
    case "ADC": return "bg-gradient-to-r from-blue-600 to-blue-400";
    case "Support": return "bg-gradient-to-r from-blue-400 to-blue-300";
    default: return "bg-gradient-to-r from-gray-500 to-gray-600";
  }
};

export const getRoleDisplayName = (role: string): string => {
  switch (role) {
    case "Top": return "Top";
    case "Jungle": return "Jng";
    case "Mid": return "Mid";
    case "ADC": return "Bot";
    case "Support": return "Sup";
    default: return role;
  }
};

export const getRoleIconPath = (role: string): string => {
  return "";
};

const RoleBadge: React.FC<RoleBadgeProps> = ({ role }) => {
  return (
    <div className={`absolute bottom-0 left-0 right-0 h-8 ${getRoleColor(role)} flex items-center justify-center shadow-md`}>
      <div className="flex items-center text-white font-medium">
        <span>{getRoleDisplayName(role)}</span>
      </div>
    </div>
  );
};

export default RoleBadge;
