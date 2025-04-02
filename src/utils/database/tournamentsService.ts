
import { supabase } from "@/integrations/supabase/client";
import { Tournament } from "../mockData";
import { getLoadedTournaments, setLoadedTournaments } from '../csvTypes';

// Get all tournaments
export const getTournaments = async (): Promise<Tournament[]> => {
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
        region: region,
        startDate: "2023-01-01", // Default date
        endDate: "2023-12-31",   // Default date
        logo: "/placeholder.svg"  // Default logo
      };
    });
    
    setLoadedTournaments(formattedTournaments);
    return formattedTournaments;
  } catch (error) {
    console.error('Erreur lors de la récupération des tournois:', error);
    return [];
  }
};
