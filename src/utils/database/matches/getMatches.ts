
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
 * Check if we have a valid cache
 */
const hasValidCache = (): boolean => {
  const now = Date.now();
  return matchesCache !== null && (now - lastMatchesCacheUpdate) < CACHE_DURATION;
};

/**
 * Update cache with new data
 */
const updateCache = (matches: Match[]): void => {
  matchesCache = matches;
  lastMatchesCacheUpdate = Date.now();
};

/**
 * Fetch raw matches data from Supabase
 */
const fetchRawMatches = async (): Promise<any[]> => {
  const { data: matches, error } = await supabase
    .from('matches')
    .select('*');
  
  if (error) {
    console.error("Erreur lors de la récupération des matchs:", error);
    return [];
  }
  
  console.log(`Récupéré ${matches.length} matchs bruts depuis Supabase`);
  return matches;
};

/**
 * Fetch teams data from Supabase
 */
const fetchTeams = async (): Promise<any[]> => {
  const { data: teamsData, error: teamsError } = await supabase
    .from('teams')
    .select('*');
  
  if (teamsError) {
    console.error("Erreur lors de la récupération des équipes:", teamsError);
    return [];
  }
  
  console.log(`Récupéré ${teamsData.length} équipes depuis Supabase`);
  return teamsData;
};

/**
 * Create a map of team IDs to team data for faster lookups
 */
const createTeamsMap = (teamsData: any[]): Map<string, any> => {
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
  return teamsMap;
};

/**
 * Create a Team object from team data
 */
const createTeamObject = (teamData: any): Team => {
  return {
    id: teamData.id,
    name: teamData.name,
    logo: teamData.logo,
    region: teamData.region,
    winRate: Number(teamData.win_rate) || 0,
    blueWinRate: Number(teamData.blue_win_rate) || 0,
    redWinRate: Number(teamData.red_win_rate) || 0,
    averageGameTime: Number(teamData.average_game_time) || 0,
    players: []
  };
};

/**
 * Find team data in the teams map
 */
const findTeamData = (teamId: string, teamsMap: Map<string, any>): any => {
  // Try direct lookup first
  let teamData = teamsMap.get(teamId);
  
  // If not found, try lowercase
  if (!teamData) {
    teamData = teamsMap.get(teamId.toLowerCase());
  }
  
  return teamData;
};

/**
 * Format a single match from database format to application format
 */
const formatMatch = (match: any, teamsMap: Map<string, any>): Match | null => {
  // Normalize team IDs to improve matching reliability
  const teamBlueId = String(match.team_blue_id).trim();
  const teamRedId = String(match.team_red_id).trim();
  
  // Find the team data for blue and red teams
  const teamBlueData = findTeamData(teamBlueId, teamsMap);
  const teamRedData = findTeamData(teamRedId, teamsMap);
  
  if (!teamBlueData) {
    console.error(`Équipe bleue non trouvée pour le match ${match.id}: ID=${teamBlueId}`);
    return null;
  }
  
  if (!teamRedData) {
    console.error(`Équipe rouge non trouvée pour le match ${match.id}: ID=${teamRedId}`);
    return null;
  }
  
  // Convert team data to Team type
  const teamBlue = createTeamObject(teamBlueData);
  const teamRed = createTeamObject(teamRedData);
  
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
    extraStats: createExtraStats(match)
  };
  
  // Add result data if match is completed
  if (match.status === 'Completed' && match.winner_team_id) {
    formattedMatch.result = createMatchResult(match);
  }
  
  return formattedMatch;
};

/**
 * Create match result object
 */
const createMatchResult = (match: any) => {
  // Fix: Ensure we always have a tuple with exactly two numbers
  // Default to [0, 0] if we can't parse the scores correctly
  const scoreBlue = typeof match.score_blue === 'number' ? match.score_blue : 
                   typeof match.score_blue === 'string' ? parseInt(match.score_blue) : 0;
                   
  const scoreRed = typeof match.score_red === 'number' ? match.score_red : 
                  typeof match.score_red === 'string' ? parseInt(match.score_red) : 0;

  // Create a fixed-length array with exactly two elements
  const score: [number, number] = [scoreBlue, scoreRed];
  
  return {
    winner: match.winner_team_id,
    score,
    duration: match.duration,
    mvp: match.mvp,
    firstBlood: match.first_blood,
    firstDragon: match.first_dragon,
    firstBaron: match.first_baron
  };
};

/**
 * Create extra stats object for match
 */
const createExtraStats = (match: any) => {
  return {
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
  };
};

/**
 * Log debug information about teams in matches
 */
const logTeamDebugInfo = (formattedMatches: Match[]): void => {
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
    const team = formattedMatches.find(m => m.teamBlue.id === id || m.teamRed.id === id);
    if (team) {
      const teamData = team.teamBlue.id === id ? team.teamBlue : team.teamRed;
      console.log(`  ID: "${id}" -> Nom: "${teamData.name}"`);
    }
  });
};

/**
 * Get all matches from the database
 */
export const getMatches = async (): Promise<Match[]> => {
  try {
    // Check if we have a recent cache
    if (hasValidCache()) {
      console.log("Utilisation des données de match en cache");
      return matchesCache as Match[];
    }
    
    console.log("Récupération des matchs depuis Supabase");
    
    // Fetch raw data
    const matches = await fetchRawMatches();
    const teamsData = await fetchTeams();
    
    // Create teams lookup map
    const teamsMap = createTeamsMap(teamsData);
    
    // Convert database format to application format
    const formattedMatches: Match[] = matches
      .map(match => formatMatch(match, teamsMap))
      .filter(match => match !== null) as Match[];
    
    console.log(`Formaté ${formattedMatches.length} matchs valides sur ${matches.length} matchs récupérés`);
    
    // Log debug information
    logTeamDebugInfo(formattedMatches);
    
    // Update cache
    updateCache(formattedMatches);
    
    return formattedMatches;
  } catch (error) {
    console.error("Erreur lors de la récupération des matchs:", error);
    return [];
  }
};

/**
 * Get all matches for a specific team by ID
 */
export const getMatchesByTeamId = async (teamId: string): Promise<Match[]> => {
  try {
    console.log(`Récupération des matchs pour l'équipe ID=${teamId}`);
    
    // Get all matches
    const allMatches = await getMatches();
    
    // Méthode 1: Correspondance exacte avec les IDs d'équipe
    const exactMatches = allMatches.filter(match => {
      return match.teamBlue.id === teamId || match.teamRed.id === teamId;
    });
    
    console.log(`1. Correspondance exacte: ${exactMatches.length} matchs pour l'équipe ${teamId}`);
    
    // Méthode 2: Correspondance avec IDs normalisés (minuscule, trimmed)
    const normalizedId = String(teamId).trim().toLowerCase();
    const normalizedMatches = allMatches.filter(match => {
      const normalizedBlueId = String(match.teamBlue.id).trim().toLowerCase();
      const normalizedRedId = String(match.teamRed.id).trim().toLowerCase();
      return normalizedBlueId === normalizedId || normalizedRedId === normalizedId;
    });
    
    console.log(`2. Correspondance normalisée: ${normalizedMatches.length} matchs pour l'équipe ${normalizedId}`);
    
    // Méthode 3: Recherche par sous-chaîne (contient l'ID)
    const substringMatches = allMatches.filter(match => {
      return match.teamBlue.id.includes(teamId) || match.teamRed.id.includes(teamId);
    });
    
    console.log(`3. Correspondance par sous-chaîne: ${substringMatches.length} matchs`);
    
    // Méthode 4: Recherche par nom d'équipe
    // Récupérer le nom de l'équipe à partir de l'ID
    const teamName = allMatches.find(match => 
      match.teamBlue.id === teamId || match.teamRed.id === teamId
    )?.teamBlue.id === teamId 
      ? allMatches.find(m => m.teamBlue.id === teamId)?.teamBlue.name
      : allMatches.find(m => m.teamRed.id === teamId)?.teamRed.name;
    
    let nameMatches: Match[] = [];
    if (teamName) {
      nameMatches = allMatches.filter(match => 
        match.teamBlue.name === teamName || match.teamRed.name === teamName
      );
      console.log(`4. Correspondance par nom d'équipe (${teamName}): ${nameMatches.length} matchs`);
    }
    
    // Méthode 5: Vérifier directement dans les données brutes
    const { data: rawMatches, error } = await supabase
      .from('matches')
      .select('*')
      .or(`team_blue_id.ilike.%${teamId}%,team_red_id.ilike.%${teamId}%`);
      
    console.log(`5. Requête directe dans Supabase: ${rawMatches?.length || 0} matchs`);
    if (error) {
      console.error("Erreur lors de la recherche directe:", error);
    }
    
    // Combiner tous les résultats et dédupliquer
    const allMatchIds = new Set<string>();
    const combinedMatches: Match[] = [];
    
    // Helper function to add unique matches
    const addUniqueMatches = (matches: Match[]) => {
      matches.forEach(match => {
        if (!allMatchIds.has(match.id)) {
          allMatchIds.add(match.id);
          combinedMatches.push(match);
        }
      });
    };
    
    // Add matches from all methods
    addUniqueMatches(exactMatches);
    addUniqueMatches(normalizedMatches);
    addUniqueMatches(substringMatches);
    addUniqueMatches(nameMatches);
    
    // Add raw matches if we found any (need to format them first)
    if (rawMatches && rawMatches.length > 0) {
      const teamsData = await fetchTeams();
      const teamsMap = createTeamsMap(teamsData);
      
      const formattedRawMatches = rawMatches
        .map(match => formatMatch(match, teamsMap))
        .filter(match => match !== null) as Match[];
      
      addUniqueMatches(formattedRawMatches);
    }
    
    // If specific match IDs were mentioned but not found, log them
    const specificMatchId = "LOLTMNT05_115052";
    const matchFound = combinedMatches.some(match => match.id === specificMatchId);
    if (!matchFound) {
      console.log(`Match spécifique ${specificMatchId} non trouvé pour l'équipe ${teamId}`);
      
      // Rechercher ce match spécifique dans tous les matchs
      const specificMatch = allMatches.find(match => match.id === specificMatchId);
      if (specificMatch) {
        console.log(`Match ${specificMatchId} existe dans la base, mais n'est pas associé à l'équipe ${teamId}`);
        console.log(`Équipes dans ce match: ${specificMatch.teamBlue.name} (${specificMatch.teamBlue.id}) vs ${specificMatch.teamRed.name} (${specificMatch.teamRed.id})`);
      }
    }
    
    console.log(`Total après déduplication: ${combinedMatches.length} matchs pour l'équipe ${teamId}`);
    return combinedMatches;
  } catch (error) {
    console.error(`Erreur lors de la récupération des matchs pour l'équipe ${teamId}:`, error);
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
