
import { supabase } from "@/integrations/supabase/client";
import { Player } from '../models/types';
import { chunk } from '../dataConverter';
import { getLoadedPlayers, setLoadedPlayers } from '../csvTypes';

// Save players to database
export const savePlayers = async (players: Player[]): Promise<boolean> => {
  try {
    // Filter out players with no team ID to prevent foreign key constraint violations
    const validPlayers = players.filter(player => player.team && player.team.trim() !== '');
    
    if (validPlayers.length !== players.length) {
      console.log(`Filtered out ${players.length - validPlayers.length} players with missing team IDs`);
    }
    
    // Insérer les joueurs par lots de 100
    const playerChunks = chunk(validPlayers, 100);
    for (const playerChunk of playerChunks) {
      const { error: playersError } = await supabase.from('players').insert(
        playerChunk.map(player => {
          // Handle champion pool parsing
          let championPoolArray: string[] = [];
          
          if (player.championPool) {
            if (Array.isArray(player.championPool)) {
              championPoolArray = player.championPool;
            } else if (typeof player.championPool === 'string') {
              // Use String() to ensure it's a string before calling split
              championPoolArray = String(player.championPool).split(',').map(c => c.trim());
            }
          }
          
          return {
            id: player.id,
            name: player.name,
            role: player.role,
            image: player.image,
            team_id: player.team,
            kda: player.kda,
            cs_per_min: player.csPerMin,
            damage_share: player.damageShare,
            champion_pool: championPoolArray
          };
        })
      );
      
      if (playersError) {
        console.error("Erreur lors de l'insertion des joueurs:", playersError);
        return false;
      }
    }
    
    console.log("Joueurs insérés avec succès");
    return true;
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des joueurs:", error);
    return false;
  }
};

// Get players from database
export const getPlayers = async (): Promise<Player[]> => {
  const loadedPlayers = getLoadedPlayers();
  if (loadedPlayers) return loadedPlayers;
  
  try {
    const { data: playersData, error: playersError } = await supabase
      .from('players')
      .select('*');
    
    if (playersError || !playersData || playersData.length === 0) {
      console.error("Erreur lors de la récupération des joueurs:", playersError);
      const { teams } = await import('../mockData');
      return teams.flatMap(team => team.players);
    }
    
    const players: Player[] = playersData.map(player => ({
      id: player.id as string,
      name: player.name as string,
      role: (player.role || 'Mid') as 'Top' | 'Jungle' | 'Mid' | 'ADC' | 'Support',
      image: player.image as string,
      team: player.team_id as string,
      kda: Number(player.kda) || 0,
      csPerMin: Number(player.cs_per_min) || 0,
      damageShare: Number(player.damage_share) || 0,
      championPool: player.champion_pool as string[] || []
    }));
    
    setLoadedPlayers(players);
    return players;
  } catch (error) {
    console.error("Erreur lors de la récupération des joueurs:", error);
    const { teams } = await import('../mockData');
    return teams.flatMap(team => team.players);
  }
};
