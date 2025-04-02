
import React from "react";

interface RoleBadgeProps {
  role: string;
}

export const getRoleColor = (role: string) => {
  const normalizedRole = role.toLowerCase().trim();
  
  if (normalizedRole === "top" || normalizedRole === "toplane") return "bg-gradient-to-r from-red-600 to-red-500";
  if (normalizedRole === "jungle" || normalizedRole === "jng" || normalizedRole === "jgl" || normalizedRole === "jg") return "bg-gradient-to-r from-green-600 to-green-500";
  if (normalizedRole === "mid" || normalizedRole === "middle" || normalizedRole === "midlane") return "bg-gradient-to-r from-yellow-500 to-yellow-400";
  if (normalizedRole === "adc" || normalizedRole === "bot" || normalizedRole === "bottom") return "bg-gradient-to-r from-blue-600 to-blue-500";
  if (normalizedRole === "support" || normalizedRole === "sup" || normalizedRole === "supp") return "bg-gradient-to-r from-purple-600 to-purple-500";
  
  return "bg-gradient-to-r from-gray-500 to-gray-400";
};

export const getRoleDisplayName = (role: string): string => {
  const normalizedRole = role.toLowerCase().trim();
  
  if (normalizedRole === "top" || normalizedRole === "toplane") return "Top";
  if (normalizedRole === "jungle" || normalizedRole === "jng" || normalizedRole === "jgl" || normalizedRole === "jg") return "Jungle";
  if (normalizedRole === "mid" || normalizedRole === "middle" || normalizedRole === "midlane") return "Mid";
  if (normalizedRole === "adc" || normalizedRole === "bot" || normalizedRole === "bottom") return "Bot";
  if (normalizedRole === "support" || normalizedRole === "sup" || normalizedRole === "supp") return "Support";
  
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
