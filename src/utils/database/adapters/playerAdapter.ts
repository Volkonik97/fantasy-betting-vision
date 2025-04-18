
import { Player } from "@/utils/models/types";

// Ensure role is always set to a valid PlayerRole value
export function adaptPlayerFromDatabase(player: any): Player {
  const damageShare = player.damage_share || player.damageshare;
  console.log(`adaptPlayerFromDatabase: processing player ${player.playername} with damage_share:`, damageShare);
  
  const adaptedPlayer = {
    id: player.playerid || "",
    name: player.playername || "",
    role: validatePlayerRole(player.position),
    team: player.teamid || "",
    kda: parseFloat(formatNumberField(player.kda)),
    csPerMin: parseFloat(formatNumberField(player.cspm)),
    damageShare: parseFloat(formatNumberField(damageShare)),
    championPool: player.champion_pool ? String(player.champion_pool) : "",
    image: player.image || ""
  };
  
  return adaptedPlayer;
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
