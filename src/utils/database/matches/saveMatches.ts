import { supabase } from '@/integrations/supabase/client';
import { Match } from '../../models/types';
import { chunk } from '../../dataConverter';
import { toast } from "sonner";

// Import the clearMatchCache function from getMatches
import { clearMatchCache } from './getMatches';

/**
 * Save matches to the database
 */
export const saveMatches = async (matches: Match[]): Promise<boolean> => {
  try {
    console.log(`Saving ${matches.length} matches to Supabase`);
    
    // Clear cache
    clearMatchCache();
    
    // Check for duplicate match IDs
    const matchIds = matches.map(match => match.id);
    const uniqueMatchIds = new Set(matchIds);
    
    if (uniqueMatchIds.size !== matches.length) {
      console.warn(`Found ${matches.length - uniqueMatchIds.size} duplicate match IDs`);
      
      // Filter out duplicates, keeping only the first occurrence of each ID
      const seenIds = new Set<string>();
      const uniqueMatches = matches.filter(match => {
        if (seenIds.has(match.id)) {
          return false;
        }
        seenIds.add(match.id);
        return true;
      });
      
      console.log(`Filtered down to ${uniqueMatches.length} unique matches`);
      
      // Use the filtered list
      matches = uniqueMatches;
    }
    
    // Insert matches in batches of 50 using upsert
    const matchChunks = chunk(matches, 50);
    let successCount = 0;
    
    for (const matchChunk of matchChunks) {
      try {
        // Debug match data for better debugging
        console.log(`Processing match batch (${matchChunk.length} matches) with objectives data`);
        
        // Safely extract objective data
        const matchObjectives = matchChunk.map(match => {
          // Initialize with default values to prevent undefined errors
          // Explicitly cast as any to avoid TypeScript errors for now
          const result = (match.result || {}) as any;
          const extraStats = (match.extraStats || {}) as any;
          
          // Explicit debug to help identify issues with match data
          const firstBlood = result.firstBlood || extraStats.first_blood || null;
          const firstDragon = result.firstDragon || extraStats.first_dragon || null;
          const firstBaron = result.firstBaron || extraStats.first_baron || null;
          const firstHerald = result.firstHerald || extraStats.first_herald || null;
          
          console.log(`Match ${match.id} objectives:`, {
            firstBlood,
            firstDragon,
            firstBaron,
            firstHerald,
            extraStats: !!extraStats
          });
          
          return {
            id: match.id,
            firstBlood,
            firstDragon,
            firstBaron,
            firstHerald
          };
        });
        
        const { error: matchesError } = await supabase
          .from('matches')
          .upsert(
            matchChunk.map(match => {
              // Explicitly cast as any to avoid TypeScript errors
              const extraStats = (match.extraStats || {}) as any;
              const result = (match.result || {}) as any;
              
              return {
                id: match.id,
                tournament: match.tournament,
                date: match.date,
                team_blue_id: match.teamBlue.id,
                team_red_id: match.teamRed.id,
                predicted_winner: match.predictedWinner,
                blue_win_odds: match.blueWinOdds,
                red_win_odds: match.redWinOdds,
                status: match.status,
                patch: extraStats.patch || '',
                year: extraStats.year || '',
                split: extraStats.split || '',
                playoffs: extraStats.playoffs || false,
                team_kpm: extraStats.team_kpm || 0,
                ckpm: extraStats.ckpm || 0,
                team_kills: extraStats.team_kills || 0,
                team_deaths: extraStats.team_deaths || 0,
                dragons: extraStats.dragons || 0,
                opp_dragons: extraStats.opp_dragons || 0,
                elemental_drakes: extraStats.elemental_drakes || 0,
                opp_elemental_drakes: extraStats.opp_elemental_drakes || 0,
                infernals: extraStats.infernals || 0,
                mountains: extraStats.mountains || 0,
                clouds: extraStats.clouds || 0,
                oceans: extraStats.oceans || 0,
                chemtechs: extraStats.chemtechs || 0,
                hextechs: extraStats.hextechs || 0,
                drakes_unknown: extraStats.drakes_unknown || 0,
                elders: extraStats.elders || 0,
                opp_elders: extraStats.opp_elders || 0,
                first_herald: result.firstHerald || extraStats.first_herald || null,
                heralds: extraStats.heralds || 0,
                opp_heralds: extraStats.opp_heralds || 0,
                first_baron: result.firstBaron || extraStats.first_baron || null,
                barons: extraStats.barons || 0,
                opp_barons: extraStats.opp_barons || 0,
                void_grubs: extraStats.void_grubs || 0,
                opp_void_grubs: extraStats.opp_void_grubs || 0,
                first_tower: result.firstTower || extraStats.first_tower || null,
                first_mid_tower: extraStats.first_mid_tower || null,
                first_three_towers: extraStats.first_three_towers || null,
                towers: extraStats.towers || 0,
                opp_towers: extraStats.opp_towers || 0,
                turret_plates: extraStats.turret_plates || 0,
                opp_turret_plates: extraStats.opp_turret_plates || 0,
                inhibitors: extraStats.inhibitors || 0,
                opp_inhibitors: extraStats.opp_inhibitors || 0,
                winner_team_id: result.winner || null,
                score_blue: result.score ? result.score[0] || 0 : 0,
                score_red: result.score ? result.score[1] || 0 : 0,
                duration: result.duration || '',
                mvp: result.mvp || '',
                first_blood: result.firstBlood || extraStats.first_blood || null,
                first_dragon: result.firstDragon || extraStats.first_dragon || null
              };
            }),
            { onConflict: 'id' }
          );
        
        if (matchesError) {
          console.error("Error upserting matches:", matchesError);
          toast.error(`Erreur lors de la mise à jour des matchs: ${matchesError.message}`);
          continue; // Continue with the next batch
        }
        
        successCount += matchChunk.length;
      } catch (error) {
        console.error("Error processing match batch:", error);
        continue; // Continue with next batch
      }
    }
    
    console.log(`Successfully upserted ${successCount}/${matches.length} matches`);
    return successCount > 0;
  } catch (error) {
    console.error("Error saving matches:", error);
    toast.error("Une erreur s'est produite lors de l'enregistrement des matchs");
    return false;
  }
};
