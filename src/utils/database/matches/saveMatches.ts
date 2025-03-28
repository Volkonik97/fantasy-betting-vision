
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
        // Debug match data
        console.log(`Processing match batch with objectives data:`, 
          matchChunk.map(m => ({
            id: m.id,
            first_blood: m.result?.firstBlood || m.extraStats?.first_blood || null,
            first_dragon: m.result?.firstDragon || m.extraStats?.first_dragon || null,
            first_baron: m.result?.firstBaron || m.extraStats?.first_baron || null,
            first_herald: m.extraStats?.first_herald || m.result?.firstHerald || null,
            first_tower: m.extraStats?.first_tower || m.result?.firstTower || null
          }))
        );
        
        const { error: matchesError } = await supabase
          .from('matches')
          .upsert(
            matchChunk.map(match => ({
              id: match.id,
              tournament: match.tournament,
              date: match.date,
              team_blue_id: match.teamBlue.id,
              team_red_id: match.teamRed.id,
              predicted_winner: match.predictedWinner,
              blue_win_odds: match.blueWinOdds,
              red_win_odds: match.redWinOdds,
              status: match.status,
              patch: match.extraStats?.patch || '',
              year: match.extraStats?.year || '',
              split: match.extraStats?.split || '',
              playoffs: match.extraStats?.playoffs || false,
              team_kpm: match.extraStats?.team_kpm || 0,
              ckpm: match.extraStats?.ckpm || 0,
              team_kills: match.extraStats?.team_kills || 0,
              team_deaths: match.extraStats?.team_deaths || 0,
              dragons: match.extraStats?.dragons || 0,
              opp_dragons: match.extraStats?.opp_dragons || 0,
              elemental_drakes: match.extraStats?.elemental_drakes || 0,
              opp_elemental_drakes: match.extraStats?.opp_elemental_drakes || 0,
              infernals: match.extraStats?.infernals || 0,
              mountains: match.extraStats?.mountains || 0,
              clouds: match.extraStats?.clouds || 0,
              oceans: match.extraStats?.oceans || 0,
              chemtechs: match.extraStats?.chemtechs || 0,
              hextechs: match.extraStats?.hextechs || 0,
              drakes_unknown: match.extraStats?.drakes_unknown || 0,
              elders: match.extraStats?.elders || 0,
              opp_elders: match.extraStats?.opp_elders || 0,
              first_herald: match.extraStats?.first_herald || match.result?.firstHerald || '',
              heralds: match.extraStats?.heralds || 0,
              opp_heralds: match.extraStats?.opp_heralds || 0,
              barons: match.extraStats?.barons || 0,
              opp_barons: match.extraStats?.opp_barons || 0,
              void_grubs: match.extraStats?.void_grubs || 0,
              opp_void_grubs: match.extraStats?.opp_void_grubs || 0,
              first_tower: match.extraStats?.first_tower || match.result?.firstTower || '',
              first_mid_tower: match.extraStats?.first_mid_tower || '',
              first_three_towers: match.extraStats?.first_three_towers || '',
              towers: match.extraStats?.towers || 0,
              opp_towers: match.extraStats?.opp_towers || 0,
              turret_plates: match.extraStats?.turret_plates || 0,
              opp_turret_plates: match.extraStats?.opp_turret_plates || 0,
              inhibitors: match.extraStats?.inhibitors || 0,
              opp_inhibitors: match.extraStats?.opp_inhibitors || 0,
              winner_team_id: match.result?.winner || null,
              score_blue: match.result?.score?.[0] || 0,
              score_red: match.result?.score?.[1] || 0,
              duration: match.result?.duration || '',
              mvp: match.result?.mvp || '',
              first_blood: match.result?.firstBlood || match.extraStats?.first_blood || '',
              first_dragon: match.result?.firstDragon || match.extraStats?.first_dragon || '',
              first_baron: match.result?.firstBaron || match.extraStats?.first_baron || ''
            })),
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
