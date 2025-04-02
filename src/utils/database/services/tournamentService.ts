
import { supabase } from '@/integrations/supabase/client';
import { Tournament } from '../../models/types';
import { getLoadedTournaments, setLoadedTournaments } from '../../csvTypes';
import { tournaments as mockTournaments } from '../../mockData';

// Get tournaments from the database
export const getTournaments = async (): Promise<Tournament[]> => {
  const loadedTournaments = getLoadedTournaments();
  if (loadedTournaments) return loadedTournaments;
  
  try {
    // In the current implementation, there's no tournaments table yet
    // We'll just return mock data for now
    // This can be expanded in the future when a tournaments table is added
    setLoadedTournaments(mockTournaments);
    return mockTournaments;
  } catch (error) {
    console.error("Erreur lors de la récupération des tournois:", error);
    return mockTournaments;
  }
};

// Get tournament by ID
export const getTournamentById = async (tournamentId: string): Promise<Tournament | null> => {
  try {
    const tournaments = await getTournaments();
    return tournaments.find(t => t.id === tournamentId) || null;
  } catch (error) {
    console.error("Error retrieving tournament by ID:", error);
    return null;
  }
};
