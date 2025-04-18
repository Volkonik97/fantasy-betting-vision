
import { Player } from "@/utils/models/types";

// Ensure role is always set to a valid PlayerRole value
export function adaptPlayerFromDatabase(player: any): Player {
  // Get damageShare from database field (checking for both field names)
  const rawDamageShare = player.damage_share !== undefined 
    ? player.damage_share 
    : (player.damageshare !== undefined ? player.damageshare : null);
    
  console.log(`adaptPlayerFromDatabase: processing player ${player.playername} with damage_share:`, 
    { rawValue: rawDamageShare, type: typeof rawDamageShare });
  
  // Convert damageShare to a proper number format
  let parsedDamageShare: number;
  try {
    if (rawDamageShare === null || rawDamageShare === undefined) {
      console.log(`adaptPlayerFromDatabase: damage_share is null or undefined for ${player.playername}`);
      parsedDamageShare = 0;
    } else {
      // First convert to string for safe processing
      const damageShareStr = String(rawDamageShare).replace(/%/g, '').trim();
      console.log(`adaptPlayerFromDatabase: damage_share as string for ${player.playername}:`, damageShareStr);
      
      // Convert to number
      parsedDamageShare = parseFloat(damageShareStr);
      
      if (isNaN(parsedDamageShare)) {
        console.log(`adaptPlayerFromDatabase: damage_share is NaN for ${player.playername}, setting to 0`);
        parsedDamageShare = 0;
      }
      
      // If it's a decimal between 0-1, correctly convert it to percentage (0-100)
      if (parsedDamageShare > 0 && parsedDamageShare < 1) {
        const originalValue = parsedDamageShare;
        parsedDamageShare = parsedDamageShare * 100;
        console.log(`adaptPlayerFromDatabase: converted decimal damage_share ${originalValue} to percentage: ${parsedDamageShare}% for ${player.playername}`);
      }
      
      // If it's a very small number, zero it out to avoid displaying near-zero values
      if (Math.abs(parsedDamageShare) < 0.0001) {
        parsedDamageShare = 0;
      }
    }
    
    console.log(`adaptPlayerFromDatabase: final damage_share for ${player.playername}:`, parsedDamageShare);
  } catch (error) {
    console.error(`Error parsing damage_share for player ${player.playername}:`, error);
    parsedDamageShare = 0;
  }
  
  return {
    id: player.playerid || "",
    name: player.playername || "",
    role: validatePlayerRole(player.position),
    team: player.teamid || "",
    kda: parseFloat(formatNumberField(player.kda)),
    csPerMin: parseFloat(formatNumberField(player.cspm)),
    damageShare: parsedDamageShare, // Use the carefully parsed value
    championPool: player.champion_pool ? String(player.champion_pool) : "",
    image: player.image || ""
  };
}

// Convert Player model to database format for saving
export function adaptPlayerForDatabase(player: Player): any {
  return {
    playerid: player.id,
    playername: player.name,
    position: player.role,
    teamid: player.team,
    kda: player.kda,
    cspm: player.csPerMin,
    damage_share: player.damageShare,
    champion_pool: player.championPool,
    image: player.image
  };
}

// Helper function to format number fields
function formatNumberField(value: any): string {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return "0";
  }
  return typeof value === 'number' ? value.toFixed(2) : Number(value).toFixed(2);
}

// Helper function to validate player role
function validatePlayerRole(role: string | null | undefined): "Top" | "Jungle" | "Mid" | "ADC" | "Support" | "Unknown" {
  if (!role) return "Unknown";
  
  const normalizedRole = role.trim().toLowerCase();
  
  switch (normalizedRole) {
    case "top":
      return "Top";
    case "jungle":
    case "jng":
      return "Jungle";
    case "mid":
    case "middle":
      return "Mid";
    case "adc":
    case "bot":
    case "bottom":
      return "ADC";
    case "support":
    case "sup":
      return "Support";
    default:
      return "Unknown";
  }
}
