
import React from "react";

interface RoleBadgeProps {
  role: string;
}

export const getRoleColor = (role: string) => {
  if (!role) return "bg-gradient-to-r from-gray-500 to-gray-400";
  
  const normalizedRole = role.toLowerCase().trim();
  
  if (normalizedRole === "top" || normalizedRole === "toplane") return "bg-gradient-to-r from-red-600 to-red-500";
  if (["jungle", "jng", "jgl", "jg", "jungler"].includes(normalizedRole)) return "bg-gradient-to-r from-green-600 to-green-500";
  if (["mid", "middle", "midlane", "midfielder"].includes(normalizedRole)) return "bg-gradient-to-r from-yellow-500 to-yellow-400";
  if (["adc", "bot", "bottom", "ad carry", "ad", "marksman", "carry"].includes(normalizedRole)) return "bg-gradient-to-r from-blue-600 to-blue-500";
  if (["support", "sup", "supp", "supporter"].includes(normalizedRole)) return "bg-gradient-to-r from-purple-600 to-purple-500";
  
  return "bg-gradient-to-r from-gray-500 to-gray-400";
};

export const getRoleDisplayName = (role: string): string => {
  if (!role) return "Unknown";
  
  const normalizedRole = role.toLowerCase().trim();
  
  if (normalizedRole === "top" || normalizedRole === "toplane") return "Top";
  if (["jungle", "jng", "jgl", "jg", "jungler"].includes(normalizedRole)) return "Jungle";
  if (["mid", "middle", "midlane", "midfielder"].includes(normalizedRole)) return "Mid";
  if (["adc", "bot", "bottom", "ad carry", "ad", "marksman", "carry"].includes(normalizedRole)) return "ADC";
  if (["support", "sup", "supp", "supporter"].includes(normalizedRole)) return "Support";
  
  return role;
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
