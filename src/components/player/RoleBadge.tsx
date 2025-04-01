
import React from "react";

interface RoleBadgeProps {
  role: string;
}

export const getRoleColor = (role: string) => {
  switch (role.toLowerCase()) {
    case "top": return "bg-slate-600";
    case "jungle": 
    case "jng": 
    case "jg": return "bg-slate-600";
    case "mid": return "bg-slate-600";
    case "adc": 
    case "bot": return "bg-slate-600";
    case "support": 
    case "sup": return "bg-slate-600";
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
    <div className="absolute bottom-0 left-0 right-0 h-8 bg-slate-600 flex items-center justify-center">
      <div className="flex items-center text-white font-medium">
        <span>{getRoleDisplayName(role)}</span>
      </div>
    </div>
  );
};

export default RoleBadge;
