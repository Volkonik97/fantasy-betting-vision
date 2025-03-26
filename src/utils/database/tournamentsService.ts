
import { supabase } from "@/integrations/supabase/client";
import { getLoadedTournaments, setLoadedTournaments } from '../csvTypes';

// Get all tournaments
export const getTournaments = async (): Promise<any[]> => {
  const loadedTournaments = getLoadedTournaments();
  if (loadedTournaments) return loadedTournaments;
  
  try {
    const { data, error } = await supabase
      .from('matches')
      .select('tournament')
      .order('tournament');
    
    if (error) {
      console.error('Erreur lors de la récupération des tournois:', error);
      return [];
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
        region: region
      };
    });
    
    setLoadedTournaments(formattedTournaments);
    return formattedTournaments;
  } catch (error) {
    console.error('Erreur lors de la récupération des tournois:', error);
    return [];
  }
};
