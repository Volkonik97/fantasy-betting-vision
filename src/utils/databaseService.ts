import { supabase } from "@/integrations/supabase/client";
import { Team, Player, Match, Tournament } from './mockData';
import { chunk } from './dataConverter';
import { 
  getLoadedTeams, 
  getLoadedPlayers, 
  getLoadedMatches, 
  getLoadedTournaments, 
  resetCache,
  setLoadedTeams,
  setLoadedPlayers,
  setLoadedMatches,
  setLoadedTournaments
} from './csvTypes';

// Database-related functions

// Check if database has data
export const hasDatabaseData = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('teams')
      .select('count');
    
    if (error) {
      console.error("Erreur lors de la vérification des données:", error);
      return false;
    }
    
    return data && data.length > 0 && data[0].count > 0;
  } catch (error) {
    console.error("Erreur lors de la vérification des données:", error);
    return false;
  }
};

// Get the last database update timestamp
export const getLastDatabaseUpdate = async (): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('data_updates')
      .select('updated_at')
      .order('updated_at', { ascending: false })
      .limit(1);
    
    if (error || !data || data.length === 0) {
      console.error("Erreur lors de la récupération de la date de mise à jour:", error);
      return null;
    }
    
    return data[0].updated_at || null;
  } catch (error) {
    console.error("Erreur lors de la récupération de la date de mise à jour:", error);
    return null;
  }
};

// Clear database
export const clearDatabase = async (): Promise<boolean> => {
  try {
    // Supprimer d'abord les tables avec des références (dans l'ordre)
    await supabase.from('matches').delete().gt('id', '');
    await supabase.from('players').delete().gt('id', '');
    await supabase.from('teams').delete().gt('id', '');
    
    // Ajouter une entrée dans la table des mises à jour
    await supabase.from('data_updates').insert([{ updated_at: new Date().toISOString() }]);
    
    // Réinitialiser le cache
    resetCache();
    
    return true;
  } catch (error) {
    console.error("Erreur lors de la suppression des données:", error);
    return false;
  }
};

// Save data to database
export const saveToDatabase = async (data: {
  teams: Team[];
  players: Player[];
  matches: Match[];
  tournaments?: Tournament[];
}): Promise<boolean> => {
  try {
    console.log("Début de la sauvegarde dans Supabase:", {
      teamsCount: data.teams.length,
      playersCount: data.players.length,
      matchesCount: data.matches.length
    });
    
    // Vider d'abord la base de données
    await clearDatabase();
    
    // Insérer les équipes par lots de 100
    const teamChunks = chunk(data.teams, 100);
    for (const teamChunk of teamChunks) {
      const { error: teamsError } = await supabase.from('teams').insert(
        teamChunk.map(team => ({
          id: team.id,
          name: team.name,
          logo: team.logo,
          region: team.region,
          win_rate: team.winRate,
          blue_win_rate: team.blueWinRate,
          red_win_rate: team.redWinRate,
          average_game_time: team.averageGameTime
        }))
      );
      
      if (teamsError) {
        console.error("Erreur lors de l'insertion des équipes:", teamsError);
        return false;
      }
    }
    
    console.log("Équipes insérées avec succès");
    
    // Insérer les joueurs par lots de 100
    const playerChunks = chunk(data.players, 100);
    for (const playerChunk of playerChunks) {
      const { error: playersError } = await supabase.from('players').insert(
        playerChunk.map(player => ({
          id: player.id,
          name: player.name,
          role: player.role,
          image: player.image,
          team_id: player.team,
          kda: player.kda,
          cs_per_min: player.csPerMin,
          damage_share: player.damageShare,
          champion_pool: Array.isArray(player.championPool) ? player.championPool : 
            (typeof player.championPool === 'string' ? player.championPool.split(',').map(c => c.trim()) : [])
        }))
      );
      
      if (playersError) {
        console.error("Erreur lors de l'insertion des joueurs:", playersError);
        return false;
      }
    }
    
    console.log("Joueurs insérés avec succès");
    
    // Insérer les matchs par lots de 100
    const matchChunks = chunk(data.matches, 100);
    for (const matchChunk of matchChunks) {
      const { error: matchesError } = await supabase.from('matches').insert(
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
          winner_team_id: match.result?.winner,
          score_blue: match.result?.score ? match.result.score[0] : null,
          score_red: match.result?.score ? match.result.score[1] : null,
          duration: match.result?.duration,
          mvp: match.result?.mvp,
          first_blood: match.result?.firstBlood,
          first_dragon: match.result?.firstDragon,
          first_baron: match.result?.firstBaron
        }))
      );
      
      if (matchesError) {
        console.error("Erreur lors de l'insertion des matchs:", matchesError);
        return false;
      }
    }
    
    console.log("Matchs insérés avec succès");
    
    // Ajouter une entrée dans la table des mises à jour
    const { error: updateError } = await supabase.from('data_updates').insert([{ updated_at: new Date().toISOString() }]);
    if (updateError) {
      console.error("Erreur lors de l'ajout d'une entrée dans data_updates:", updateError);
    }
    
    console.log("Données sauvegardées dans Supabase avec succès");
    return true;
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des données:", error);
    return false;
  }
};

// Get teams from database
export const getTeams = async (): Promise<Team[]> => {
  const loadedTeams = getLoadedTeams();
  if (loadedTeams) return loadedTeams;
  
  try {
    const { data: teamsData, error: teamsError } = await supabase
      .from('teams')
      .select('*');
    
    if (teamsError || !teamsData || teamsData.length === 0) {
      console.error("Erreur lors de la récupération des équipes:", teamsError);
      const { teams } = await import('./mockData');
      return teams;
    }
    
    const { data: playersData, error: playersError } = await supabase
      .from('players')
      .select('*');
    
    if (playersError) {
      console.error("Erreur lors de la récupération des joueurs:", playersError);
    }
    
    const teams: Team[] = teamsData.map(team => ({
      id: team.id as string,
      name: team.name as string,
      logo: team.logo as string,
      region: team.region as string,
      winRate: Number(team.win_rate) || 0,
      blueWinRate: Number(team.blue_win_rate) || 0,
      redWinRate: Number(team.red_win_rate) || 0,
      averageGameTime: Number(team.average_game_time) || 0,
      players: []
    }));
    
    if (playersData) {
      teams.forEach(team => {
        team.players = playersData
          .filter(player => player.team_id === team.id)
          .map(player => ({
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
      });
    }
    
    return teams;
  } catch (error) {
    console.error("Erreur lors de la récupération des équipes:", error);
    const { teams } = await import('./mockData');
    return teams;
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
      const { teams } = await import('./mockData');
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
    
    return players;
  } catch (error) {
    console.error("Erreur lors de la récupération des joueurs:", error);
    const { teams } = await import('./mockData');
    return teams.flatMap(team => team.players);
  }
};

// Get matches from database
export const getMatches = async (): Promise<Match[]> => {
  const loadedMatches = getLoadedMatches();
  if (loadedMatches) return loadedMatches;
  
  try {
    const { data: matchesData, error: matchesError } = await supabase
      .from('matches')
      .select('*');
    
    if (matchesError || !matchesData || matchesData.length === 0) {
      console.error("Erreur lors de la récupération des matchs:", matchesError);
      const { matches } = await import('./mockData');
      return matches;
    }
    
    const teams = await getTeams();
    
    const matches: Match[] = matchesData.map(match => {
      const teamBlue = teams.find(t => t.id === match.team_blue_id) || teams[0];
      const teamRed = teams.find(t => t.id === match.team_red_id) || teams[1];
      
      const matchObject: Match = {
        id: match.id as string,
        tournament: match.tournament as string,
        date: match.date as string,
        teamBlue,
        teamRed,
        predictedWinner: match.predicted_winner as string,
        blueWinOdds: Number(match.blue_win_odds) || 0.5,
        redWinOdds: Number(match.red_win_odds) || 0.5,
        status: (match.status || 'Upcoming') as 'Upcoming' | 'Live' | 'Completed'
      };
      
      if (match.status === 'Completed' && match.winner_team_id) {
        matchObject.result = {
          winner: match.winner_team_id as string,
          score: [Number(match.score_blue) || 0, Number(match.score_red) || 0],
          duration: match.duration as string | undefined,
          mvp: match.mvp as string | undefined,
          firstBlood: match.first_blood as string | undefined,
          firstDragon: match.first_dragon as string | undefined,
          firstBaron: match.first_baron as string | undefined
        };
      }
      
      return matchObject;
    });
    
    return matches;
  } catch (error) {
    console.error("Erreur lors de la récupération des matchs:", error);
    const { matches } = await import('./mockData');
    return matches;
  }
};

// Get all tournaments
export const getTournaments = async (): Promise<any[]> => {
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
    return tournaments.map(tournament => {
      // Handle the case where tournament might be null or undefined
      const tournamentName = tournament || "Unknown Tournament";
      
      return {
        id: tournamentName.replace(/\s+/g, '-').toLowerCase(),
        name: tournamentName,
        region: tournamentName.includes(',') 
          ? tournamentName.split(',')[0]
          : "Global"
      };
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des tournois:', error);
    return [];
  }
};

// Get side statistics for a team
export const getSideStatistics = async (teamId: string) => {
  try {
    const teams = await getTeams();
    const team = teams.find(t => t.id === teamId);
    
    if (team) {
      return {
        blueWins: Math.round(team.blueWinRate * 100),
        redWins: Math.round(team.redWinRate * 100),
        blueFirstBlood: 62,
        redFirstBlood: 58,
        blueFirstDragon: 71,
        redFirstDragon: 65,
        blueFirstHerald: 68,
        redFirstHerald: 59,
        blueFirstTower: 65,
        redFirstTower: 62
      };
    }
    
    const { getSideStatistics: getMockSideStatistics } = await import('./mockData');
    return getMockSideStatistics(teamId);
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    const { getSideStatistics: getMockSideStatistics } = await import('./mockData');
    return getMockSideStatistics(teamId);
  }
};
