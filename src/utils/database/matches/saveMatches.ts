import { supabase } from "@/integrations/supabase/client";
import { Match } from "@/utils/models/types";
import { chunk } from "../../dataConverter";
import { toast } from "sonner";
import { clearMatchCache } from './getMatches';
import { adaptMatchForDatabase } from "../adapters/matchAdapter";

/**
 * Save matches to the database
 */
export const saveMatches = async (matches: Match[]): Promise<boolean> => {
  try {
    console.log(`Enregistrement de ${matches.length} matchs dans Supabase`);
    
    // Clear cache
    clearMatchCache();
    
    // Check for duplicate match IDs
    const matchIds = matches.map((match) => match.id);
    const uniqueMatchIds = new Set(matchIds);
    
    if (uniqueMatchIds.size !== matches.length) {
      console.warn(`Trouvé ${matches.length - uniqueMatchIds.size} IDs de match en double`);
      
      // Filter out duplicates, keeping only the first occurrence of each ID
      const seenIds = new Set();
      const uniqueMatches = matches.filter((match) => {
        if (seenIds.has(match.id)) {
          return false;
        }
        seenIds.add(match.id);
        return true;
      });
      
      console.log(`Filtré à ${uniqueMatches.length} matchs uniques`);
      
      // Use the filtered list
      matches = uniqueMatches;
    }
    
    // Insert matches in batches of 50 using upsert
    const matchChunks = chunk(matches, 50);
    let successCount = 0;
    
    for (const matchChunk of matchChunks) {
      try {
        // Debug match data for better debugging
        console.log(`Traitement d'un lot de ${matchChunk.length} matchs avec données d'objectifs`);
        
        // Log a sample match to verify data
        if (matchChunk.length > 0) {
          const sampleMatch = matchChunk[0];
          console.log('Exemple de données de match:', {
            id: sampleMatch.id,
            extraStats: sampleMatch.extraStats ? {
              dragons: sampleMatch.extraStats.dragons,
              barons: sampleMatch.extraStats.barons,
              first_blood: sampleMatch.extraStats.first_blood,
              first_blood_type: typeof sampleMatch.extraStats.first_blood,
              picks: sampleMatch.extraStats.picks ? 'Present' : 'Pas de picks',
              bans: sampleMatch.extraStats.bans ? 'Present' : 'Pas de bans'
            } : 'Pas de extraStats',
            result: sampleMatch.result ? {
              winner: sampleMatch.result.winner,
              firstBlood: sampleMatch.result.firstBlood,
              firstDragon: sampleMatch.result.firstDragon
            } : 'Pas de résultat'
          });
        }
        
        // Convert matches to database format
        const dbMatches = matchChunk.map(match => adaptMatchForDatabase(match));
        
        // Perform the upsert
        const { error: matchesError } = await supabase
          .from('matches')
          .upsert(dbMatches, {
            onConflict: 'gameid'
          });
          
        if (matchesError) {
          console.error("Erreur lors de la mise à jour des matchs:", matchesError);
          toast.error(`Erreur lors de la mise à jour des matchs: ${matchesError.message}`);
          continue; // Continue with the next batch
        }
        
        successCount += matchChunk.length;
      } catch (error) {
        console.error("Erreur lors du traitement du lot de matchs:", error);
        continue; // Continue with next batch
      }
    }
    
    console.log(`Mise à jour réussie pour ${successCount}/${matches.length} matchs`);
    return successCount > 0;
  } catch (error) {
    console.error("Erreur lors de l'enregistrement des matchs:", error);
    toast.error("Une erreur s'est produite lors de l'enregistrement des matchs");
    return false;
  }
};
