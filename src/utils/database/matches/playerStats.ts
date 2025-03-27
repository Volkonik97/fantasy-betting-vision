
import { supabase } from '@/integrations/supabase/client';

/**
 * Get player match statistics
 */
export const getPlayerMatchStats = async (playerId: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('player_match_stats')
      .select('*')
      .eq('player_id', playerId);
    
    if (error) {
      console.error("Erreur lors de la récupération des statistiques du joueur:", error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques du joueur:", error);
    return [];
  }
};

/**
 * Save player match statistics
 */
export const savePlayerMatchStats = async (match: any): Promise<boolean> => {
  try {
    if (!match.playerStats || match.playerStats.length === 0) {
      return true;
    }

    // Filter out player stats with missing player_id or team_id
    const validPlayerStats = match.playerStats.filter(
      (stat: any) => stat.player_id && stat.player_id.trim() !== '' && 
                stat.team_id && stat.team_id.trim() !== ''
    );
    
    if (validPlayerStats.length !== match.playerStats.length) {
      console.log(`Match ${match.id}: Filtered out ${match.playerStats.length - validPlayerStats.length} player stats with missing IDs`);
    }
    
    // Prepare player stats for database insertion
    const dbPlayerStats = validPlayerStats.map((stat: any) => ({
      match_id: match.id,
      player_id: stat.player_id,
      team_id: stat.team_id,
      participant_id: stat.participant_id,
      side: stat.side,
      position: stat.position,
      champion: stat.champion,
      kills: stat.kills,
      deaths: stat.deaths,
      assists: stat.assists,
      double_kills: stat.double_kills,
      triple_kills: stat.triple_kills,
      quadra_kills: stat.quadra_kills,
      penta_kills: stat.penta_kills,
      first_blood_kill: stat.first_blood_kill,
      first_blood_assist: stat.first_blood_assist,
      first_blood_victim: stat.first_blood_victim,
      damage_to_champions: stat.damage_to_champions,
      dpm: stat.dpm,
      damage_share: stat.damage_share,
      damage_taken_per_minute: stat.damage_taken_per_minute,
      damage_mitigated_per_minute: stat.damage_mitigated_per_minute,
      wards_placed: stat.wards_placed,
      wpm: stat.wpm,
      wards_killed: stat.wards_killed,
      wcpm: stat.wcpm,
      control_wards_bought: stat.control_wards_bought,
      vision_score: stat.vision_score,
      vspm: stat.vspm,
      total_gold: stat.total_gold,
      earned_gold: stat.earned_gold,
      earned_gpm: stat.earned_gpm,
      earned_gold_share: stat.earned_gold_share,
      gold_spent: stat.gold_spent,
      gspd: stat.gspd,
      gpr: stat.gpr,
      total_cs: stat.total_cs,
      minion_kills: stat.minion_kills,
      monster_kills: stat.monster_kills,
      monster_kills_own_jungle: stat.monster_kills_own_jungle,
      monster_kills_enemy_jungle: stat.monster_kills_enemy_jungle,
      cspm: stat.cspm,
      gold_at_10: stat.gold_at_10,
      xp_at_10: stat.xp_at_10,
      cs_at_10: stat.cs_at_10,
      opp_gold_at_10: stat.opp_gold_at_10,
      opp_xp_at_10: stat.opp_xp_at_10,
      opp_cs_at_10: stat.opp_cs_at_10,
      gold_diff_at_10: stat.gold_diff_at_10,
      xp_diff_at_10: stat.xp_diff_at_10,
      cs_diff_at_10: stat.cs_diff_at_10,
      kills_at_10: stat.kills_at_10,
      assists_at_10: stat.assists_at_10,
      deaths_at_10: stat.deaths_at_10,
      opp_kills_at_10: stat.opp_kills_at_10,
      opp_assists_at_10: stat.opp_assists_at_10,
      opp_deaths_at_10: stat.opp_deaths_at_10,
      gold_at_15: stat.gold_at_15,
      xp_at_15: stat.xp_at_15,
      cs_at_15: stat.cs_at_15,
      opp_gold_at_15: stat.opp_gold_at_15,
      opp_xp_at_15: stat.opp_xp_at_15,
      opp_cs_at_15: stat.opp_cs_at_15,
      gold_diff_at_15: stat.gold_diff_at_15,
      xp_diff_at_15: stat.xp_diff_at_15,
      cs_diff_at_15: stat.cs_diff_at_15,
      kills_at_15: stat.kills_at_15,
      assists_at_15: stat.assists_at_15,
      deaths_at_15: stat.deaths_at_15,
      opp_kills_at_15: stat.opp_kills_at_15,
      opp_assists_at_15: stat.opp_assists_at_15,
      opp_deaths_at_15: stat.opp_deaths_at_15,
      gold_at_20: stat.gold_at_20,
      xp_at_20: stat.xp_at_20,
      cs_at_20: stat.cs_at_20,
      opp_gold_at_20: stat.opp_gold_at_20,
      opp_xp_at_20: stat.opp_xp_at_20,
      opp_cs_at_20: stat.opp_cs_at_20,
      gold_diff_at_20: stat.gold_diff_at_20,
      xp_diff_at_20: stat.xp_diff_at_20,
      cs_diff_at_20: stat.cs_diff_at_20,
      kills_at_20: stat.kills_at_20,
      assists_at_20: stat.assists_at_20,
      deaths_at_20: stat.deaths_at_20,
      opp_kills_at_20: stat.opp_kills_at_20,
      opp_assists_at_20: stat.opp_assists_at_20,
      opp_deaths_at_20: stat.opp_deaths_at_20,
      gold_at_25: stat.gold_at_25,
      xp_at_25: stat.xp_at_25,
      cs_at_25: stat.cs_at_25,
      opp_gold_at_25: stat.opp_gold_at_25,
      opp_xp_at_25: stat.opp_xp_at_25,
      opp_cs_at_25: stat.opp_cs_at_25,
      gold_diff_at_25: stat.gold_diff_at_25,
      xp_diff_at_25: stat.xp_diff_at_25,
      cs_diff_at_25: stat.cs_diff_at_25,
      kills_at_25: stat.kills_at_25,
      assists_at_25: stat.assists_at_25,
      deaths_at_25: stat.deaths_at_25,
      opp_kills_at_25: stat.opp_kills_at_25,
      opp_assists_at_25: stat.opp_assists_at_25,
      opp_deaths_at_25: stat.opp_deaths_at_25
    }));
    
    if (dbPlayerStats.length === 0) {
      return true; // No valid player stats to save
    }
    
    // Insert player stats
    const { error: statsError } = await supabase
      .from('player_match_stats')
      .upsert(dbPlayerStats);
    
    if (statsError) {
      console.error("Erreur lors de la sauvegarde des statistiques des joueurs:", statsError);
      console.error("Détails de l'erreur:", statsError.details);
      return false;
    }
    
    console.log(`Match ${match.id}: ${dbPlayerStats.length} player stats inserted successfully`);
    return true;
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des statistiques des joueurs:", error);
    return false;
  }
};
