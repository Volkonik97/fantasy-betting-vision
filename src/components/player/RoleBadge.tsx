
import React from "react";

interface RoleBadgeProps {
  role: string;
}

export const getRoleColor = (role: string) => {
  switch (role.toLowerCase()) {
    case "top": return "bg-red-600";
    case "jungle": 
    case "jng": 
    case "jg": return "bg-green-600";
    case "mid": return "bg-purple-600";
    case "adc": 
    case "bot": return "bg-blue-600";
    case "support": 
    case "sup": return "bg-cyan-500";
    default: return "bg-slate-600";
  }
};

export const getRoleDisplayName = (role: string): string => {
  switch (role.toLowerCase()) {
    case "top": return "top";
    case "jungle": 
    case "jng":
    case "jg": return "jng";
    case "mid": return "mid";
    case "adc": 
    case "bot": return "bot";
    case "support": 
    case "sup": return "sup";
    default: return role.toLowerCase();
  }
};

export const getRoleIconPath = (role: string): string => {
  return "";
};

const RoleBadge: React.FC<RoleBadgeProps> = ({ role }) => {
  return (
    <div className={`absolute bottom-0 left-0 right-0 h-8 ${getRoleColor(role)} flex items-center justify-center`}>
      <div className="flex items-center text-white font-medium">
        <span>{getRoleDisplayName(role)}</span>
      </div>
    </div>
  );
};

export default RoleBadge;
