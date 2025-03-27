import { supabase } from "@/integrations/supabase/client";
import { Player } from '../models/types';
import { chunk } from '../dataConverter';
import { getLoadedPlayers, setLoadedPlayers } from '../csvTypes';
import { toast } from "sonner";

// Save players to database
export const savePlayers = async (players: Player[]): Promise<boolean> => {
  try {
    console.log(`Saving ${players.length} players to Supabase`);
    
    // Filter out players with no team ID to prevent foreign key constraint violations
    const validPlayers = players.filter(player => player.team && player.team.trim() !== '');
    
    if (validPlayers.length !== players.length) {
      console.log(`Filtered out ${players.length - validPlayers.length} players with missing team IDs`);
    }
    
    // Check for duplicate player IDs
    const playerIds = validPlayers.map(player => player.id);
    const uniquePlayerIds = new Set(playerIds);
    
    if (uniquePlayerIds.size !== validPlayers.length) {
      console.warn(`Found ${validPlayers.length - uniquePlayerIds.size} duplicate player IDs`);
      
      // Filter out duplicates, keeping only the first occurrence of each ID
      const seenIds = new Set<string>();
      const uniquePlayers = validPlayers.filter(player => {
        if (seenIds.has(player.id)) {
          return false;
        }
        seenIds.add(player.id);
        return true;
      });
      
      console.log(`Filtered down to ${uniquePlayers.length} unique players`);
      
      // Use the filtered list
      validPlayers.length = 0;
      validPlayers.push(...uniquePlayers);
    }
    
    // Insérer les joueurs par lots de 50 using upsert
    let successCount = 0;
    const playerChunks = chunk(validPlayers, 50);
    
    for (const playerChunk of playerChunks) {
      try {
        const { error: playersError } = await supabase
          .from('players')
          .upsert(
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
            }),
            { onConflict: 'id' }
          );
        
        if (playersError) {
          console.error("Erreur lors de l'upsert des joueurs:", playersError);
          toast.error(`Erreur lors de la mise à jour des joueurs: ${playersError.message}`);
          continue; // Continue with the next batch
        }
        
        successCount += playerChunk.length;
      } catch (error) {
        console.error("Erreur lors du traitement d'un lot de joueurs:", error);
        continue; // Continue with next batch
      }
    }
    
    console.log(`Successfully upserted ${successCount}/${validPlayers.length} players`);
    return successCount > 0;
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des joueurs:", error);
    toast.error("Une erreur s'est produite lors de l'enregistrement des joueurs");
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

// Get player by ID
export const getPlayerById = async (playerId: string): Promise<Player | null> => {
  try {
    // Check loaded players first
    const loadedPlayers = getLoadedPlayers();
    if (loadedPlayers) {
      const player = loadedPlayers.find(p => p.id === playerId);
      if (player) return player;
    }
    
    // If not found in loaded players, query the database
    const { data: playerData, error } = await supabase
      .from('players')
      .select('*')
      .eq('id', playerId)
      .single();
    
    if (error || !playerData) {
      console.error("Error fetching player by ID:", error);
      return null;
    }
    
    // Convert database format to application format
    const player: Player = {
      id: playerData.id as string,
      name: playerData.name as string,
      role: (playerData.role || 'Mid') as 'Top' | 'Jungle' | 'Mid' | 'ADC' | 'Support',
      image: playerData.image as string,
      team: playerData.team_id as string,
      kda: Number(playerData.kda) || 0,
      csPerMin: Number(playerData.cs_per_min) || 0,
      damageShare: Number(playerData.damage_share) || 0,
      championPool: playerData.champion_pool as string[] || []
    };
    
    return player;
  } catch (error) {
    console.error("Error retrieving player by ID:", error);
    
    // Fallback to mock data if database query fails
    const { players } = await import('../models/mockPlayers');
    return players.find(p => p.id === playerId) || null;
  }
};
