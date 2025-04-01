
import React from "react";
import { ShieldCheck, Axe, Target, Swords, Heart } from "lucide-react";

interface RoleBadgeProps {
  role: string;
}

export const getRoleColor = (role: string) => {
  switch (role) {
    case "Top": return "bg-gradient-to-r from-yellow-500 to-yellow-600";
    case "Jungle": return "bg-gradient-to-r from-green-500 to-green-600";
    case "Mid": return "bg-gradient-to-r from-blue-500 to-blue-600";
    case "ADC": return "bg-gradient-to-r from-red-500 to-red-600";
    case "Support": return "bg-gradient-to-r from-purple-500 to-purple-600";
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

export const getRoleIcon = (role: string) => {
  switch (role) {
    case "Top": 
      return <Axe className="h-4 w-4 mr-1" />;
    case "Jungle": 
      return <Swords className="h-4 w-4 mr-1" />;
    case "Mid": 
      return <Target className="h-4 w-4 mr-1" />;
    case "ADC": 
      return <Axe className="h-4 w-4 mr-1" />; 
    case "Support": 
      return <Heart className="h-4 w-4 mr-1" />;
    default: 
      return <ShieldCheck className="h-4 w-4 mr-1" />;
  }
};

const RoleBadge: React.FC<RoleBadgeProps> = ({ role }) => {
  return (
    <div className={`absolute bottom-0 left-0 right-0 h-8 ${getRoleColor(role)} flex items-center justify-center shadow-md`}>
      <div className="flex items-center text-white font-medium">
        {getRoleIcon(role)}
        <span>{getRoleDisplayName(role)}</span>
      </div>
    </div>
  );
};

export default RoleBadge;
