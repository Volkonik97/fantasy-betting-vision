
import React from "react";

interface RoleBadgeProps {
  role: string;
}

export const getRoleColor = (role: string) => {
  switch (role.toLowerCase()) {
    case "top": return "bg-rose-400";
    case "jungle": 
    case "jng": 
    case "jg": return "bg-emerald-400";
    case "mid": return "bg-violet-400";
    case "adc": 
    case "bot": return "bg-sky-400";
    case "support": 
    case "sup": return "bg-teal-400";
    default: return "bg-slate-400";
  }
};

export const getRoleDisplayName = (role: string): string => {
  switch (role.toLowerCase()) {
    case "top": return "Top";
    case "jungle": 
    case "jng":
    case "jg": return "Jungle";
    case "mid": return "Mid";
    case "adc": 
    case "bot": return "Bot";
    case "support": 
    case "sup": return "Support";
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
