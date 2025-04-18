
import { Player } from "@/utils/models/types";

// Ensure role is always set to a valid PlayerRole value
export function adaptPlayerFromDatabase(player: any): Player {
  return {
    id: player.playerid || "",
    name: player.playername || "",
    role: validatePlayerRole(player.position),
    team: player.teamid || "",
    kda: parseFloat(formatNumberField(player.kda)),
    csPerMin: parseFloat(formatNumberField(player.cspm)),
    killParticipation: parseFloat(formatNumberField(player.kill_participation_pct)),
    championPool: player.champion_pool ? String(player.champion_pool) : "",
    image: player.image || "",
    // Optional additional fields from database
    damageShare: player.damage_share ? parseFloat(formatNumberField(player.damage_share)) : undefined,
    vspm: player.vspm ? parseFloat(formatNumberField(player.vspm)) : undefined,
    wcpm: player.wcpm ? parseFloat(formatNumberField(player.wcpm)) : undefined,
    goldSharePercent: player.gold_share_percent ? parseFloat(formatNumberField(player.gold_share_percent)) : undefined,
    // Database-specific fields (for player_summary_view)
    avg_kills: player.avg_kills ? parseFloat(formatNumberField(player.avg_kills)) : undefined,
    avg_deaths: player.avg_deaths ? parseFloat(formatNumberField(player.avg_deaths)) : undefined,
    avg_assists: player.avg_assists ? parseFloat(formatNumberField(player.avg_assists)) : undefined,
    cspm: player.cspm ? parseFloat(formatNumberField(player.cspm)) : undefined,
    gold_share_percent: player.gold_share_percent ? parseFloat(formatNumberField(player.gold_share_percent)) : undefined,
    earned_gold_share: player.earned_gold_share ? parseFloat(formatNumberField(player.earned_gold_share)) : undefined,
    dmg_per_gold: player.dmg_per_gold ? parseFloat(formatNumberField(player.dmg_per_gold)) : undefined,
    match_count: player.match_count ? parseInt(player.match_count, 10) : undefined,
    dpm: player.dpm ? parseFloat(formatNumberField(player.dpm)) : undefined,
    efficiency_score: player.efficiency_score ? parseFloat(formatNumberField(player.efficiency_score)) : undefined,
    aggression_score: player.aggression_score ? parseFloat(formatNumberField(player.aggression_score)) : undefined,
    earlygame_score: player.earlygame_score ? parseFloat(formatNumberField(player.earlygame_score)) : undefined,
    kill_participation_pct: player.kill_participation_pct ? parseFloat(formatNumberField(player.kill_participation_pct)) : undefined
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
    image: player.image,
    kill_participation_pct: player.killParticipation
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
