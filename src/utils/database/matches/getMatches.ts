
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
  console.log("Cache des matchs vidé");
};

/**
 * Get all matches from the database
 */
export const getMatches = async (): Promise<Match[]> => {
  try {
    // Check if we have a recent cache
    const now = Date.now();
    if (matchesCache && (now - lastMatchesCacheUpdate) < CACHE_DURATION) {
      console.log("Utilisation des données de match en cache");
      return matchesCache;
    }
    
    console.log("Récupération des matchs depuis Supabase");
    
    const { data: matches, error } = await supabase
      .from('matches')
      .select('*');
    
    if (error) {
      console.error("Erreur lors de la récupération des matchs:", error);
      return [];
    }
    
    console.log(`Récupéré ${matches.length} matchs bruts depuis Supabase`);
    
    // Fetch teams separately to populate match data
    const { data: teamsData, error: teamsError } = await supabase
      .from('teams')
      .select('*');
    
    if (teamsError) {
      console.error("Erreur lors de la récupération des équipes:", teamsError);
      return [];
    }
    
    console.log(`Récupéré ${teamsData.length} équipes depuis Supabase`);
    
    // Create a map of team IDs to team data for faster lookups
    const teamsMap = new Map();
    teamsData.forEach(team => {
      // Store using multiple keys for more robust matching
      const id = team.id;
      teamsMap.set(id, team); 
      
      // Also store with trimmed ID and lowercase for case-insensitive matching
      if (typeof id === 'string') {
        teamsMap.set(id.trim(), team);
        teamsMap.set(id.trim().toLowerCase(), team);
      }
      
      // Store by name for name-based lookups
      teamsMap.set(team.name, team);
    });
    
    console.log(`Créé une map de ${teamsMap.size} entrées d'équipes`);
    
    // Convert database format to application format
    const formattedMatches: Match[] = matches
      .map(match => {
        // Normalize team IDs to improve matching reliability
        const teamBlueId = String(match.team_blue_id).trim();
        const teamRedId = String(match.team_red_id).trim();
        
        // Find the team data for blue and red teams with multiple lookup attempts
        let teamBlueData = teamsMap.get(teamBlueId);
        if (!teamBlueData) {
          teamBlueData = teamsMap.get(teamBlueId.toLowerCase());
        }
        
        let teamRedData = teamsMap.get(teamRedId);
        if (!teamRedData) {
          teamRedData = teamsMap.get(teamRedId.toLowerCase());
        }
        
        if (!teamBlueData) {
          console.error(`Équipe bleue non trouvée pour le match ${match.id}: ID=${teamBlueId}`);
          return null;
        }
        
        if (!teamRedData) {
          console.error(`Équipe rouge non trouvée pour le match ${match.id}: ID=${teamRedId}`);
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
      })
      .filter(match => match !== null) as Match[];
    
    console.log(`Formaté ${formattedMatches.length} matchs valides sur ${matches.length} matchs récupérés`);
    
    // Debug: List some team IDs to help track issues
    const teamIds = new Set<string>();
    formattedMatches.forEach(match => {
      teamIds.add(match.teamBlue.id);
      teamIds.add(match.teamRed.id);
    });
    console.log(`Nombre d'équipes uniques dans les matchs: ${teamIds.size}`);
    
    // Debug: List IDs and names of first few teams to check consistency
    console.log("Échantillon des équipes dans les matchs:");
    const sampleTeams = Array.from(teamIds).slice(0, 5);
    sampleTeams.forEach(id => {
      const team = teamsMap.get(id);
      if (team) {
        console.log(`  ID: "${id}" -> Nom: "${team.name}"`);
      }
    });
    
    // Update cache
    matchesCache = formattedMatches;
    lastMatchesCacheUpdate = now;
    
    return formattedMatches;
  } catch (error) {
    console.error("Erreur lors de la récupération des matchs:", error);
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
    console.error(`Erreur lors de la récupération du match par ID ${matchId}:`, error);
    return null;
  }
};
