import { Player } from "@/utils/models/types";

/**
 * Adapts a player from the database structure to the application structure
 */
export const adaptPlayerFromDatabase = (data: any): Player => {
  // Log incoming data to debug kill_participation_pct
  console.log(`Adapting player ${data.playername}, kill_participation_pct:`, data.kill_participation_pct);

  return {
    id: data.playerid || '',
    name: data.playername || '',
    role: data.position || 'Unknown',
    image: data.image || '',
    team: data.teamid || '',
    
    // Stats
    kda: data.kda || 0,
    csPerMin: data.cspm || 0,
    damageShare: data.damage_share || 0,
    
    // Kill participation - prioritize the field from player_summary_view
    killParticipation: data.kill_participation_pct !== undefined ? data.kill_participation_pct : 0,
    
    // Champion pool
    championPool: data.champion_pool ? String(data.champion_pool) : '',
    
    // Additional stats
    dpm: data.dpm || 0,
    vspm: data.vspm || 0,
    wcpm: data.wcpm || 0,
    gold_share_percent: data.gold_share_percent || 0,
    
    // Timeline stats
    avg_kills: data.avg_kills || 0,
    avg_deaths: data.avg_deaths || 0,
    avg_assists: data.avg_assists || 0,
    
    // Early game stats
    golddiffat15: data.golddiffat15 || 0,
    xpdiffat15: data.xpdiffat15 || 0,
    csdiffat15: data.csdiffat15 || 0,
    
    // Performance scores
    efficiency_score: data.efficiency_score || 0,
    aggression_score: data.aggression_score || 0,
    earlygame_score: data.earlygame_score || 0,
    
    // Match count
    match_count: data.match_count || 0,
    
    // Other stats that might be available
    dmg_per_gold: data.dmg_per_gold || 0,
    kill_participation_pct: data.kill_participation_pct || 0 // Keep the original field too
  };
};

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
