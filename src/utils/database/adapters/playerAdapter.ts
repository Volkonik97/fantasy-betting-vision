
import { Player } from "@/utils/models/types";

// Ensure role is always set to a valid PlayerRole value
export function adaptPlayerFromDatabase(player: any): Player {
  // Get damageShare value safely - check multiple possible field names
  let damageShare = null;
  
  // Check various possible field names for damage share data
  if (player.damage_share !== undefined) {
    damageShare = player.damage_share;
    console.log(`Found damage_share field for ${player.playername}:`, damageShare);
  } else if (player.damageshare !== undefined) {
    damageShare = player.damageshare;
    console.log(`Found damageshare field for ${player.playername}:`, damageShare);
  } else if (player.damageShare !== undefined) {
    damageShare = player.damageShare;
    console.log(`Found damageShare field for ${player.playername}:`, damageShare);
  }
  
  // Process damageShare carefully
  let processedDamageShare: number = 0;
  
  if (damageShare !== null && damageShare !== undefined) {
    try {
      // Convert to string first to handle any input format
      const damageShareString = String(damageShare).trim();
      
      // Remove any percentage sign if present
      const cleanedValue = damageShareString.replace(/%/g, '');
      
      // Parse the numeric value
      const numericValue = parseFloat(cleanedValue);
      
      if (!isNaN(numericValue)) {
        // If it's a decimal between 0-1, convert to percentage (0-100 scale)
        if (numericValue > 0 && numericValue < 1) {
          processedDamageShare = numericValue * 100;
          console.log(`Converted decimal damage share ${numericValue} to percentage: ${processedDamageShare} for ${player.playername}`);
        } else {
          processedDamageShare = numericValue;
        }
      }
      
      console.log(`Final processed damageShare for ${player.playername}:`, processedDamageShare);
    } catch (error) {
      console.error(`Error processing damage share for ${player.playername}:`, error);
      processedDamageShare = 0;
    }
  } else {
    console.log(`No damage share found for ${player.playername}, using default 0`);
  }
  
  // Create and return the player object with all processed values
  return {
    id: player.playerid || "",
    name: player.playername || "",
    role: validatePlayerRole(player.position),
    team: player.teamid || "",
    kda: parseFloat(formatNumberField(player.kda)),
    csPerMin: parseFloat(formatNumberField(player.cspm)),
    damageShare: processedDamageShare, // Use our carefully processed damage share value
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
