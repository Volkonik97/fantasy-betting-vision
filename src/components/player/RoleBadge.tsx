
import React from "react";

interface RoleBadgeProps {
  role: string;
}

export const getRoleColor = (role: string) => {
  switch (role) {
    case "Top": return "bg-yellow-500";
    case "Jungle": return "bg-green-500";
    case "Mid": return "bg-blue-500";
    case "ADC": return "bg-red-500";
    case "Support": return "bg-purple-500";
    default: return "bg-gray-500";
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

const RoleBadge: React.FC<RoleBadgeProps> = ({ role }) => {
  return (
    <div className={`absolute bottom-0 left-0 right-0 h-8 ${getRoleColor(role)} flex items-center justify-center`}>
      <span className="text-white font-medium">{getRoleDisplayName(role)}</span>
    </div>
  );
};

export default RoleBadge;
