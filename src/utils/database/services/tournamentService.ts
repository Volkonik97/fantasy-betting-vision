
import { supabase } from '@/integrations/supabase/client';
import { Tournament } from '../../models/types';
import { getLoadedTournaments, setLoadedTournaments } from '../../csv/cache/dataCache';
import { tournaments as mockTournaments } from '../../models/mockTournaments';

// Cache variable to avoid redundant requests
let cachedTournaments: Tournament[] | null = null;
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes cache expiry
let lastCacheTime = 0;

// Check if cache is valid
const isCacheValid = () => {
  return cachedTournaments && (Date.now() - lastCacheTime < CACHE_EXPIRY);
};

// Get tournaments from the database with improved caching
export const getTournaments = async (): Promise<Tournament[]> => {
  // First check internal memory cache for immediate response
  if (isCacheValid()) {
    console.log("Using in-memory tournaments cache");
    return cachedTournaments!;
  }
  
  // Then check the module-level cache
  const loadedTournaments = getLoadedTournaments();
  if (loadedTournaments) {
    console.log("Using module-level tournaments cache");
    cachedTournaments = loadedTournaments;
    lastCacheTime = Date.now();
    return loadedTournaments;
  }
  
  try {
    console.log("Fetching tournaments from database");
    
    // Query unique tournaments from matches table
    const { data, error } = await supabase
      .from('matches')
      .select('tournament')
      .order('tournament');
    
    if (error) {
      console.error("Error retrieving tournaments from database:", error);
      cachedTournaments = mockTournaments;
      lastCacheTime = Date.now();
      setLoadedTournaments(mockTournaments);
      return mockTournaments;
    }
    
    if (!data || data.length === 0) {
      console.warn("No tournaments found in database, using mock data");
      cachedTournaments = mockTournaments;
      lastCacheTime = Date.now();
      setLoadedTournaments(mockTournaments);
      return mockTournaments;
    }
    
    // Extract unique tournaments
    const tournaments = [...new Set(data.map(match => match.tournament))];
    
    // Format tournaments data
    const formattedTournaments = tournaments.map(tournament => {
      // Handle the case where tournament might be null or undefined
      const tournamentName = tournament || "Unknown Tournament";
      const region = tournamentName.includes(',') 
        ? tournamentName.split(',')[0]
        : "Global";
      
      return {
        id: tournamentName.replace(/\s+/g, '-').toLowerCase(),
        name: tournamentName,
        region: region,
        startDate: "2023-01-01", // Default date
        endDate: "2023-12-31",   // Default date
        logo: "/placeholder.svg"  // Default logo
      };
    });
    
    // Update caches
    cachedTournaments = formattedTournaments;
    lastCacheTime = Date.now();
    setLoadedTournaments(formattedTournaments);
    
    return formattedTournaments;
  } catch (error) {
    console.error("Error retrieving tournaments:", error);
    
    // Fallback to mock data
    cachedTournaments = mockTournaments;
    lastCacheTime = Date.now();
    setLoadedTournaments(mockTournaments);
    return mockTournaments;
  }
};

// Get tournament by ID with cached results
export const getTournamentById = async (tournamentId: string): Promise<Tournament | null> => {
  try {
    const tournaments = await getTournaments();
    return tournaments.find(t => t.id === tournamentId) || null;
  } catch (error) {
    console.error("Error retrieving tournament by ID:", error);
    return null;
  }
};
