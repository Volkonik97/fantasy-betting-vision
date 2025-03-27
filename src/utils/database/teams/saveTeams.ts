import { supabase } from "@/integrations/supabase/client";
import { Team } from '../../models/types';
import { chunk } from '../../dataConverter';
import { toast } from "sonner";
import { clearTeamsCache } from './teamCache';

/**
 * Save teams to database
 */
export const saveTeams = async (teams: Team[]): Promise<boolean> => {
  try {
    console.log(`Saving ${teams.length} teams to Supabase`);
    
    // Clear cache when saving new teams
    clearTeamsCache();
    
    // Check for duplicate team IDs
    const teamIds = teams.map(team => team.id);
    const uniqueTeamIds = new Set(teamIds);
    
    if (uniqueTeamIds.size !== teams.length) {
      console.warn(`Found ${teams.length - uniqueTeamIds.size} duplicate team IDs in the input data`);
      
      // Create a map to find duplicates
      const idCounts = teamIds.reduce((acc, id) => {
        acc[id] = (acc[id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      // Log duplicates
      Object.entries(idCounts)
        .filter(([_, count]) => count > 1)
        .forEach(([id, count]) => {
          console.warn(`Team ID "${id}" appears ${count} times`);
        });
      
      // Filter out duplicates, keeping only the first occurrence of each ID
      const seenIds = new Set<string>();
      teams = teams.filter(team => {
        if (seenIds.has(team.id)) {
          return false;
        }
        seenIds.add(team.id);
        return true;
      });
      
      console.log(`Filtered down to ${teams.length} unique teams`);
    }
    
    // Insert teams in batches of 50 using upsert (on conflict update)
    const teamChunks = chunk(teams, 50);
    let successCount = 0;
    
    for (const teamChunk of teamChunks) {
      try {
        const { error: teamsError } = await supabase
          .from('teams')
          .upsert(
            teamChunk.map(team => ({
              id: team.id,
              name: team.name,
              logo: team.logo,
              region: team.region,
              win_rate: team.winRate,
              blue_win_rate: team.blueWinRate,
              red_win_rate: team.redWinRate,
              average_game_time: team.averageGameTime
            })),
            { onConflict: 'id' }
          );
        
        if (teamsError) {
          console.error("Error upserting teams batch:", teamsError);
          toast.error(`Erreur lors de la mise à jour des équipes: ${teamsError.message}`);
          continue; // Continue with the next batch rather than stopping everything
        }
        
        successCount += teamChunk.length;
      } catch (error) {
        console.error("Error during team batch upsert:", error);
        continue; // Continue with the next batch
      }
    }
    
    console.log(`Successfully upserted ${successCount}/${teams.length} teams`);
    return successCount > 0;
  } catch (error) {
    console.error("Error saving teams:", error);
    toast.error("Une erreur s'est produite lors de l'enregistrement des équipes");
    return false;
  }
};
