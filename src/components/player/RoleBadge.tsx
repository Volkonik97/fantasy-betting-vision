
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
  // Use public direct paths for role icons
  switch (role) {
    case "Top": return "/lovable-uploads/e8ad379a-9beb-4829-9c74-75a074568549.png";
    case "Jungle": return "/lovable-uploads/072fbcd9-2c2a-4db9-b9d1-771a0b61f798.png";
    case "Mid": return "/lovable-uploads/e8933329-1041-4555-b178-03885c253dff.png";
    case "ADC": return "/lovable-uploads/e1e0225a-15c3-4752-81a5-31b23ff17f11.png";
    case "Support": return "/lovable-uploads/e761b17f-b6df-45c6-9d0f-ee9bf718fe90.png";
    default: return "";
  }
};

const RoleBadge: React.FC<RoleBadgeProps> = ({ role }) => {
  return (
    <div className={`absolute bottom-0 left-0 right-0 h-8 ${getRoleColor(role)} flex items-center justify-center shadow-md`}>
      <div className="flex items-center text-white font-medium">
        <img 
          src={getRoleIconPath(role)} 
          alt={`${role} icon`}
          className="w-5 h-5 mr-1 object-contain"
          onError={(e) => {
            console.error(`Failed to load role icon for ${role}`);
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.style.display = 'none';
          }}
        />
        <span>{getRoleDisplayName(role)}</span>
      </div>
    </div>
  );
};

export default RoleBadge;
