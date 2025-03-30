
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { chunk } from '@/utils/dataConverter';

/**
 * Sauvegarde les statistiques d'équipe par match dans la base de données
 * @param teamMatchStats Liste des statistiques d'équipe par match à sauvegarder
 * @param progressCallback Callback pour suivre la progression
 */
export async function saveTeamMatchStats(
  teamMatchStats: any[],
  progressCallback?: (current: number, total: number) => void
): Promise<boolean> {
  try {
    const total = teamMatchStats.length;
    console.log(`Sauvegarde de ${total} statistiques d'équipe par match...`);
    
    if (total === 0) {
      console.log('Aucune statistique d\'équipe par match à sauvegarder.');
      return true;
    }
    
    // Préparation des données pour l'insertion
    const statsToInsert = teamMatchStats.map(stat => ({
      match_id: stat.match_id,
      team_id: stat.team_id,
      is_blue_side: stat.side === 'blue',
      kills: stat.team_kills,
      deaths: stat.team_deaths,
      kpm: stat.team_kpm,
      dragons: stat.dragons,
      elemental_drakes: stat.elemental_drakes,
      infernals: stat.infernals,
      mountains: stat.mountains,
      clouds: stat.clouds,
      oceans: stat.oceans,
      chemtechs: stat.chemtechs,
      hextechs: stat.hextechs,
      drakes_unknown: stat.drakes_unknown,
      elders: stat.elders,
      heralds: stat.heralds,
      barons: stat.barons,
      void_grubs: stat.void_grubs,
      towers: stat.towers,
      turret_plates: stat.turret_plates,
      inhibitors: stat.inhibitors,
      first_blood: stat.first_blood === true,
      first_dragon: stat.first_dragon === true,
      first_herald: stat.first_herald === true,
      first_baron: stat.first_baron === true,
      first_tower: stat.first_tower === true,
      first_mid_tower: stat.first_mid_tower === true,
      first_three_towers: stat.first_three_towers === true,
      picks: stat.picks ? JSON.stringify(stat.picks) : null,
      bans: stat.bans ? JSON.stringify(stat.bans) : null
    }));
    
    // Diviser les données en lots pour éviter les limitations de taille de requête
    const chunkSize = 100;
    const chunks = chunk(statsToInsert, chunkSize);
    let currentCount = 0;
    
    // Insérer chaque lot
    for (const [index, batch] of chunks.entries()) {
      const { error } = await supabase
        .from('team_match_stats')
        .upsert(batch, {
          onConflict: 'match_id,team_id',
          ignoreDuplicates: false
        });
      
      if (error) {
        console.error(`Erreur lors de l'insertion du lot ${index + 1}/${chunks.length}:`, error);
        toast.error(`Erreur lors de la sauvegarde des statistiques d'équipe: ${error.message}`);
        return false;
      }
      
      currentCount += batch.length;
      if (progressCallback) {
        progressCallback(currentCount, total);
      }
      
      // Petite pause pour éviter de surcharger la base de données
      if (chunks.length > 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    console.log(`${total} statistiques d'équipe par match sauvegardées avec succès.`);
    return true;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des statistiques d\'équipe:', error);
    toast.error(`Erreur lors de la sauvegarde des statistiques d'équipe: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    return false;
  }
}
