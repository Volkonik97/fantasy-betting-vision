
import React from "react";

interface RoleBadgeProps {
  role: string;
}

export const getRoleColor = (role: string) => {
  const normalizedRole = normalizeRoleName(role);
  
  switch (normalizedRole) {
    case "Top": return "bg-gradient-to-r from-red-800 to-red-600";
    case "Jungle": return "bg-gradient-to-r from-green-600 to-green-400";
    case "Mid": return "bg-gradient-to-r from-orange-400 to-orange-300";
    case "ADC": return "bg-gradient-to-r from-blue-600 to-blue-400";
    case "Support": return "bg-gradient-to-r from-blue-400 to-blue-300";
    default: return "bg-gradient-to-r from-gray-500 to-gray-600";
  }
};

export const getRoleDisplayName = (role: string): string => {
  const normalizedRole = normalizeRoleName(role);
  
  switch (normalizedRole) {
    case "Top": return "Top";
    case "Jungle": return "Jng";
    case "Mid": return "Mid";
    case "ADC": return "Bot";
    case "Support": return "Sup";
    default: return role;
  }
};

// Helper function to normalize role names
export const normalizeRoleName = (role: string): string => {
  if (!role) return "Mid"; // Default to Mid if role is undefined
  
  const roleUpper = role.toUpperCase();
  
  if (roleUpper.includes("TOP")) return "Top";
  if (roleUpper.includes("JUNG") || roleUpper.includes("JNG") || roleUpper === "JG") return "Jungle";
  if (roleUpper.includes("MID")) return "Mid";
  if (roleUpper.includes("ADC") || roleUpper.includes("BOT") || roleUpper.includes("BOTTOM")) return "ADC";
  if (roleUpper.includes("SUP") || roleUpper.includes("SP")) return "Support";
  
  return role; // Return original if no match
};

export const getRoleIconPath = (role: string): string => {
  // Remove all image references - they're causing errors
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
