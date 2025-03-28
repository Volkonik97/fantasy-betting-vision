
import { supabase } from '@/integrations/supabase/client';
import { Team, Match } from '../../models/types';
import { Json } from '@/integrations/supabase/types';

// Cache for matches
let matchesCache: Match[] | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
let lastMatchesCacheUpdate = 0;

// Function to clear cache (used when saving new matches)
export const clearMatchCache = (): void => {
  matchesCache = null;
  lastMatchesCacheUpdate = 0;
  console.log("Match cache cleared");
};

/**
 * Get all matches from the database
 */
export const getMatches = async (): Promise<Match[]> => {
  try {
    // Check if we have a recent cache
    const now = Date.now();
    if (matchesCache && (now - lastMatchesCacheUpdate) < CACHE_DURATION) {
      console.log("Using cached matches data");
      return matchesCache;
    }
    
    console.log("Fetching matches from Supabase");
    
    const { data: matches, error } = await supabase
      .from('matches')
      .select('*');
    
    if (error) {
      console.error("Error retrieving matches:", error);
      return [];
    }
    
    console.log(`Retrieved ${matches.length} raw matches from Supabase`);
    
    // Fetch teams separately to populate match data
    const { data: teamsData, error: teamsError } = await supabase
      .from('teams')
      .select('*');
    
    if (teamsError) {
      console.error("Error retrieving teams:", teamsError);
      return [];
    }
    
    console.log(`Retrieved ${teamsData.length} teams from Supabase`);
    
    // Convert database format to application format
    const formattedMatches: Match[] = matches.map(match => {
      // Find the team data for blue and red teams
      const teamBlueData = teamsData.find(team => team.id === match.team_blue_id);
      const teamRedData = teamsData.find(team => team.id === match.team_red_id);
      
      if (!teamBlueData || !teamRedData) {
        console.error(`Teams not found for match ${match.id}: Blue=${match.team_blue_id}, Red=${match.team_red_id}`);
        return null;
      }
      
      // Convert team data to Team type
      const teamBlue: Team = {
        id: teamBlueData.id,
        name: teamBlueData.name,
        logo: teamBlueData.logo,
        region: teamBlueData.region,
        winRate: Number(teamBlueData.win_rate) || 0,
        blueWinRate: Number(teamBlueData.blue_win_rate) || 0,
        redWinRate: Number(teamBlueData.red_win_rate) || 0,
        averageGameTime: Number(teamBlueData.average_game_time) || 0,
        players: []
      };
      
      const teamRed: Team = {
        id: teamRedData.id,
        name: teamRedData.name,
        logo: teamRedData.logo,
        region: teamRedData.region,
        winRate: Number(teamRedData.win_rate) || 0,
        blueWinRate: Number(teamRedData.blue_win_rate) || 0,
        redWinRate: Number(teamRedData.red_win_rate) || 0,
        averageGameTime: Number(teamRedData.average_game_time) || 0,
        players: []
      };
      
      const formattedMatch: Match = {
        id: match.id,
        tournament: match.tournament,
        date: match.date,
        teamBlue,
        teamRed,
        predictedWinner: match.predicted_winner,
        blueWinOdds: match.blue_win_odds,
        redWinOdds: match.red_win_odds,
        status: match.status as 'Upcoming' | 'Live' | 'Completed',
        extraStats: {
          patch: match.patch,
          year: match.year,
          split: match.split,
          playoffs: match.playoffs === true,
          team_kpm: match.team_kpm,
          ckpm: match.ckpm,
          team_kills: match.team_kills,
          team_deaths: match.team_deaths,
          dragons: match.dragons,
          opp_dragons: match.opp_dragons,
          elemental_drakes: match.elemental_drakes,
          opp_elemental_drakes: match.opp_elemental_drakes,
          infernals: match.infernals,
          mountains: match.mountains,
          clouds: match.clouds,
          oceans: match.oceans,
          chemtechs: match.chemtechs,
          hextechs: match.hextechs,
          drakes_unknown: match.drakes_unknown,
          elders: match.elders,
          opp_elders: match.opp_elders,
          first_herald: match.first_herald,
          heralds: match.heralds,
          opp_heralds: match.opp_heralds,
          barons: match.barons,
          opp_barons: match.opp_barons,
          void_grubs: match.void_grubs,
          opp_void_grubs: match.opp_void_grubs,
          first_tower: match.first_tower,
          first_mid_tower: match.first_mid_tower,
          first_three_towers: match.first_three_towers,
          towers: match.towers,
          opp_towers: match.opp_towers,
          turret_plates: match.turret_plates,
          opp_turret_plates: match.opp_turret_plates,
          inhibitors: match.inhibitors,
          opp_inhibitors: match.opp_inhibitors
        }
      };
      
      if (match.status === 'Completed' && match.winner_team_id) {
        formattedMatch.result = {
          winner: match.winner_team_id,
          score: [
            typeof match.score_blue === 'number' ? match.score_blue : 
              typeof match.score_blue === 'string' ? parseInt(match.score_blue) : 0, 
            typeof match.score_red === 'number' ? match.score_red : 
              typeof match.score_red === 'string' ? parseInt(match.score_red) : 0
          ],
          duration: match.duration,
          mvp: match.mvp,
          firstBlood: match.first_blood,
          firstDragon: match.first_dragon,
          firstBaron: match.first_baron
        };
      }
      
      return formattedMatch;
    }).filter(match => match !== null) as Match[];
    
    console.log(`Formatted ${formattedMatches.length} valid matches out of ${matches.length} retrieved matches`);
    
    // Update cache
    matchesCache = formattedMatches;
    lastMatchesCacheUpdate = now;
    
    return formattedMatches;
  } catch (error) {
    console.error("Error retrieving matches:", error);
    return [];
  }
};

/**
 * Get a specific match by ID
 */
export const getMatchById = async (matchId: string): Promise<Match | null> => {
  try {
    // First check if match is in cache
    if (matchesCache) {
      const cachedMatch = matchesCache.find(match => match.id === matchId);
      if (cachedMatch) {
        return cachedMatch;
      }
    }
    
    // Not in cache, need to fetch all matches
    const matches = await getMatches();
    return matches.find(match => match.id === matchId) || null;
  } catch (error) {
    console.error(`Error getting match by ID ${matchId}:`, error);
    return null;
  }
};
