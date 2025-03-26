import Papa, { ParseResult } from 'papaparse';
import { Team, Player, Match, Tournament } from './mockData';
import { supabase } from "@/integrations/supabase/client";

// Types pour les données CSV
export interface TeamCSV {
  id: string;
  name: string;
  logo: string;
  region: string;
  winRate: string;
  blueWinRate: string;
  redWinRate: string;
  averageGameTime: string;
}

export interface PlayerCSV {
  id: string;
  name: string;
  role: string;
  image: string;
  team: string;
  kda: string;
  csPerMin: string;
  damageShare: string;
  championPool: string;
}

export interface MatchCSV {
  id: string;
  tournament: string;
  date: string;
  teamBlueId: string;
  teamRedId: string;
  predictedWinner: string;
  blueWinOdds: string;
  redWinOdds: string;
  status: string;
  winnerTeamId?: string;
  scoreBlue?: string;
  scoreRed?: string;
  duration?: string;
  mvp?: string;
  firstBlood?: string;
  firstDragon?: string;
  firstBaron?: string;
}

// Interface pour les données League of Legends
export interface LeagueGameDataRow {
  gameid: string;
  league: string;
  year: string;
  split: string;
  playoffs: string;
  date: string;
  game: string;
  patch: string;
  participantid: string;
  side: string;
  position: string;
  playername: string;
  playerid: string;
  teamname: string;
  teamid: string;
  champion: string;
  gamelength: string;
  result: string;
  kills: string;
  deaths: string;
  assists: string;
  [key: string]: string;
}

// Cache pour stocker les données chargées
let loadedTeams: Team[] | null = null;
let loadedPlayers: Player[] | null = null;
let loadedMatches: Match[] | null = null;
let loadedTournaments: Tournament[] | null = null;

// Fonction pour vérifier si la base de données contient des données
export const hasDatabaseData = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('teams')
      .select('count')
      .single();
    
    if (error) {
      console.error("Erreur lors de la vérification des données:", error);
      return false;
    }
    
    return data && typeof data.count === 'number' && data.count > 0;
  } catch (error) {
    console.error("Erreur lors de la vérification des données:", error);
    return false;
  }
};

// Fonction pour obtenir la date de la dernière mise à jour
export const getLastDatabaseUpdate = async (): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('data_updates')
      .select('updated_at')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      console.error("Erreur lors de la récupération de la date de mise à jour:", error);
      return null;
    }
    
    return data && data.updated_at ? data.updated_at : null;
  } catch (error) {
    console.error("Erreur lors de la récupération de la date de mise à jour:", error);
    return null;
  }
};

// Fonction pour vider la base de données
export const clearDatabase = async (): Promise<boolean> => {
  try {
    // Supprimer d'abord les tables avec des références (dans l'ordre)
    await supabase.from('matches').delete().neq('id', '');
    await supabase.from('players').delete().neq('id', '');
    await supabase.from('teams').delete().neq('id', '');
    
    // Ajouter une entrée dans la table des mises à jour
    await supabase.from('data_updates').insert([{ updated_at: new Date().toISOString() }]);
    
    // Réinitialiser le cache
    loadedTeams = null;
    loadedPlayers = null;
    loadedMatches = null;
    loadedTournaments = null;
    
    return true;
  } catch (error) {
    console.error("Erreur lors de la suppression des données:", error);
    return false;
  }
};

// Fonction pour sauvegarder les données dans Supabase
const saveToDatabase = async (data: {
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
        }) as any)
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
        }) as any)
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
        }) as any)
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

// Fonction pour diviser un tableau en morceaux (chunks)
function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

// Fonction pour charger un fichier CSV
export const parseCSVFile = (file: File): Promise<ParseResult<any>> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        resolve(results);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

// Fonction pour charger des données CSV à partir d'une URL
export const parseCSVFromURL = (url: string): Promise<ParseResult<any>> => {
  return new Promise((resolve, reject) => {
    Papa.parse(url, {
      download: true,
      header: true,
      complete: (results) => {
        resolve(results);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

// Convertir des données CSV en objets pour l'application
export const convertTeamData = (teamsCSV: TeamCSV[]): Team[] => {
  return teamsCSV.map(team => ({
    id: team.id,
    name: team.name,
    logo: team.logo,
    region: team.region,
    winRate: parseFloat(team.winRate) || 0,
    blueWinRate: parseFloat(team.blueWinRate) || 0,
    redWinRate: parseFloat(team.redWinRate) || 0,
    averageGameTime: parseFloat(team.averageGameTime) || 0,
    players: []
  }));
};

export const convertPlayerData = (playersCSV: PlayerCSV[]): Player[] => {
  return playersCSV.map(player => ({
    id: player.id,
    name: player.name,
    role: player.role as 'Top' | 'Jungle' | 'Mid' | 'ADC' | 'Support',
    image: player.image,
    team: player.team,
    kda: parseFloat(player.kda) || 0,
    csPerMin: parseFloat(player.csPerMin) || 0,
    damageShare: parseFloat(player.damageShare) || 0,
    championPool: player.championPool ? player.championPool.split(',').map(champ => champ.trim()) : []
  }));
};

export const convertMatchData = (matchesCSV: MatchCSV[], teams: Team[]): Match[] => {
  return matchesCSV.map(match => {
    const teamBlue = teams.find(t => t.id === match.teamBlueId) || teams[0];
    const teamRed = teams.find(t => t.id === match.teamRedId) || teams[1];
    
    const matchObject: Match = {
      id: match.id,
      tournament: match.tournament,
      date: match.date,
      teamBlue,
      teamRed,
      predictedWinner: match.predictedWinner,
      blueWinOdds: parseFloat(match.blueWinOdds) || 0.5,
      redWinOdds: parseFloat(match.redWinOdds) || 0.5,
      status: match.status as 'Upcoming' | 'Live' | 'Completed'
    };

    if (match.status === 'Completed' && match.winnerTeamId) {
      matchObject.result = {
        winner: match.winnerTeamId,
        score: [parseInt(match.scoreBlue || '0'), parseInt(match.scoreRed || '0')],
        duration: match.duration,
        mvp: match.mvp,
        firstBlood: match.firstBlood,
        firstDragon: match.firstDragon,
        firstBaron: match.firstBaron
      };
    }

    return matchObject;
  });
};

// Fonction pour extraire l'ID de la feuille Google depuis l'URL
export const extractSheetId = (url: string): string => {
  const regex = /\/d\/([a-zA-Z0-9-_]+)/;
  const match = url.match(regex);
  if (match && match[1]) {
    return match[1];
  }
  throw new Error("Format d'URL Google Sheets invalide");
};

// Fonction pour obtenir l'URL CSV exportable d'une feuille Google Sheets
export const getGSheetCSVUrl = (sheetId: string, sheetName: string = ''): string => {
  if (sheetName) {
    return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
  }
  return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`;
};

// Fonction pour transformer les données LOL en format attendu par l'application
export const processLeagueData = (data: LeagueGameDataRow[]): {
  teams: Team[];
  players: Player[];
  matches: Match[];
} => {
  // Vérifier si les données sont valides
  if (!data || data.length === 0) {
    console.error("Aucune donnée League à traiter");
    return { teams: [], players: [], matches: [] };
  }
  
  console.log(`Traitement de ${data.length} lignes de données League`);
  
  const uniqueTeams = new Map<string, TeamCSV>();
  data.forEach(row => {
    if (row.teamid && !uniqueTeams.has(row.teamid)) {
      uniqueTeams.set(row.teamid, {
        id: row.teamid,
        name: row.teamname || row.teamid,
        logo: '',
        region: row.league || '',
        winRate: '0',
        blueWinRate: '0',
        redWinRate: '0',
        averageGameTime: '0'
      });
    }
  });

  console.log(`Nombre d'équipes uniques identifiées: ${uniqueTeams.size}`);

  const teamStats = new Map<string, { wins: number, losses: number, blueWins: number, blueLosses: number, redWins: number, redLosses: number, gameTimes: number[] }>();
  data.forEach(row => {
    if (!row.teamid) return;
    
    const teamId = row.teamid;
    if (!teamStats.has(teamId)) {
      teamStats.set(teamId, { wins: 0, losses: 0, blueWins: 0, blueLosses: 0, redWins: 0, redLosses: 0, gameTimes: [] });
    }
    
    const stats = teamStats.get(teamId)!;
    const isWin = row.result === '1';
    const gameLength = parseFloat(row.gamelength);
    
    if (isWin) stats.wins++;
    else stats.losses++;
    
    if (row.side && row.side.toLowerCase() === 'blue') {
      if (isWin) stats.blueWins++;
      else stats.blueLosses++;
    } else if (row.side && row.side.toLowerCase() === 'red') {
      if (isWin) stats.redWins++;
      else stats.redLosses++;
    }
    
    if (!isNaN(gameLength)) {
      stats.gameTimes.push(gameLength);
    }
  });

  teamStats.forEach((stats, teamId) => {
    const team = uniqueTeams.get(teamId);
    if (team) {
      const totalGames = stats.wins + stats.losses;
      const blueGames = stats.blueWins + stats.blueLosses;
      const redGames = stats.redWins + stats.redLosses;
      
      team.winRate = totalGames > 0 ? (stats.wins / totalGames).toFixed(2) : '0';
      team.blueWinRate = blueGames > 0 ? (stats.blueWins / blueGames).toFixed(2) : '0';
      team.redWinRate = redGames > 0 ? (stats.redWins / redGames).toFixed(2) : '0';
      
      const avgGameTime = stats.gameTimes.length > 0 
        ? stats.gameTimes.reduce((sum, time) => sum + time, 0) / stats.gameTimes.length
        : 0;
      team.averageGameTime = avgGameTime.toFixed(1);
    }
  });

  const uniquePlayers = new Map<string, PlayerCSV>();
  data.forEach(row => {
    if (row.playerid && !uniquePlayers.has(row.playerid)) {
      uniquePlayers.set(row.playerid, {
        id: row.playerid,
        name: row.playername || row.playerid,
        role: row.position || 'Jungle',
        image: '',
        team: row.teamid || '',
        kda: '0',
        csPerMin: '0',
        damageShare: '0',
        championPool: ''
      });
    }
  });

  console.log(`Nombre de joueurs uniques identifiés: ${uniquePlayers.size}`);

  const playerStats = new Map<string, { kills: number, deaths: number, assists: number, games: number, cs: number, championsPlayed: Set<string> }>();
  data.forEach(row => {
    if (!row.playerid) return;
    
    const playerId = row.playerid;
    if (!playerStats.has(playerId)) {
      playerStats.set(playerId, { kills: 0, deaths: 0, assists: 0, games: 0, cs: 0, championsPlayed: new Set() });
    }
    
    const stats = playerStats.get(playerId)!;
    stats.kills += parseInt(row.kills) || 0;
    stats.deaths += parseInt(row.deaths) || 0;
    stats.assists += parseInt(row.assists) || 0;
    stats.games++;
    
    const minionKills = parseInt(row.minionkills || '0') || 0;
    const monsterKills = parseInt(row.monsterkills || '0') || 0;
    stats.cs += minionKills + monsterKills;
    
    if (row.champion) {
      stats.championsPlayed.add(row.champion);
    }
  });

  playerStats.forEach((stats, playerId) => {
    const player = uniquePlayers.get(playerId);
    if (player) {
      const kda = stats.deaths > 0 ? ((stats.kills + stats.assists) / stats.deaths).toFixed(2) : ((stats.kills + stats.assists) * 1).toFixed(2);
      const csPerMin = stats.games > 0 ? (stats.cs / stats.games / 30).toFixed(2) : '0';
      
      player.kda = kda;
      player.csPerMin = csPerMin;
      player.damageShare = '0.25';
      player.championPool = Array.from(stats.championsPlayed).join(',');
    }
  });

  // Extraire tous les ID de matchs uniques
  const gameIds = new Set<string>();
  data.forEach(row => {
    if (row.gameid) {
      gameIds.add(row.gameid);
    }
  });

  console.log(`Nombre de matchs uniques identifiés: ${gameIds.size}`);

  const uniqueMatches = new Map<string, { 
    gameId: string, 
    date: string, 
    teams: { blue: string, red: string },
    result?: string,
    duration?: string,
    tournament?: string
  }>();
  
  data.forEach(row => {
    if (!row.gameid) return;
    
    const gameId = row.gameid;
    if (!uniqueMatches.has(gameId)) {
      uniqueMatches.set(gameId, { 
        gameId,
        date: row.date || new Date().toISOString(),
        teams: { 
          blue: '', 
          red: '' 
        },
        tournament: `${row.league || 'Unknown'} ${row.year || ''} ${row.split || ''}`
      });
    }
    
    const match = uniqueMatches.get(gameId)!;
    if (row.side && row.side.toLowerCase() === 'blue' && row.teamid) {
      match.teams.blue = row.teamid;
    } else if (row.side && row.side.toLowerCase() === 'red' && row.teamid) {
      match.teams.red = row.teamid;
    }
    
    match.duration = row.gamelength;
    
    if (row.result === '1' && row.teamid) {
      match.result = row.teamid;
    }
  });

  const teams = Array.from(uniqueTeams.values());
  const teamsConverted = convertTeamData(teams);
  
  const players = Array.from(uniquePlayers.values());
  const playersConverted = convertPlayerData(players);
  
  teamsConverted.forEach(team => {
    team.players = playersConverted.filter(player => player.team === team.id);
  });
  
  const matchesArray: MatchCSV[] = Array.from(uniqueMatches.values())
    .filter(match => match.teams.blue && match.teams.red) // S'assurer que les équipes bleue et rouge sont définies
    .map(match => {
      const matchCSV: MatchCSV = {
        id: match.gameId,
        tournament: match.tournament || 'Unknown Tournament',
        date: match.date,
        teamBlueId: match.teams.blue,
        teamRedId: match.teams.red,
        predictedWinner: match.teams.blue,
        blueWinOdds: '0.5',
        redWinOdds: '0.5',
        status: match.result ? 'Completed' : 'Upcoming'
      };
      
      if (match.result) {
        matchCSV.winnerTeamId = match.result;
        matchCSV.duration = match.duration;
      }
      
      return matchCSV;
    });
  
  console.log(`Conversion finale en ${matchesArray.length} matchs`);
  const matchesConverted = convertMatchData(matchesArray, teamsConverted);
  
  return {
    teams: teamsConverted,
    players: playersConverted,
    matches: matchesConverted
  };
};

// Fonction pour charger les données depuis Google Sheets (format unique)
export const loadFromSingleGoogleSheet = async (sheetUrl: string): Promise<{
  teams: Team[];
  players: Player[];
  matches: Match[];
}> => {
  try {
    console.log("Début du chargement depuis Google Sheets (format unique):", sheetUrl);
    const sheetId = extractSheetId(sheetUrl);
    
    const csvUrl = getGSheetCSVUrl(sheetId);
    console.log("URL CSV générée:", csvUrl);
    
    const results = await parseCSVFromURL(csvUrl);
    console.log(`Données chargées: ${results.data.length} lignes, ${Object.keys(results.data[0] || {}).length} colonnes`);
    
    // Vérifier si les données semblent être au format League
    const firstRow = results.data[0] as any;
    const isLeagueFormat = firstRow && (firstRow.gameid || firstRow.teamid || firstRow.playerid);
    
    if (!isLeagueFormat) {
      throw new Error("Format de données non reconnu. Assurez-vous d'utiliser un format compatible.");
    }
    
    const data = processLeagueData(results.data as LeagueGameDataRow[]);
    
    console.log("Données traitées:", {
      teams: data.teams.length,
      players: data.players.length, 
      matches: data.matches.length
    });
    
    loadedTeams = data.teams;
    loadedPlayers = data.players;
    loadedMatches = data.matches;
    
    await saveToDatabase(data);
    
    return data;
  } catch (error) {
    console.error('Erreur lors du chargement des données Google Sheets:', error);
    throw error;
  }
};

// Fonction pour charger les données depuis Google Sheets (onglets multiples)
export const loadFromGoogleSheets = async (sheetUrl: string): Promise<{
  teams: Team[];
  players: Player[];
  matches: Match[];
}> => {
  try {
    console.log("Tentative de chargement depuis Google Sheets:", sheetUrl);
    const sheetId = extractSheetId(sheetUrl);
    
    try {
      // D'abord essayer le format à feuille unique (Oracle's Elixir)
      console.log("Essai du format à feuille unique...");
      return await loadFromSingleGoogleSheet(sheetUrl);
    } catch (error) {
      console.log("Le format à feuille unique a échoué, essai du format à onglets multiples...");
      
      const teamsUrl = getGSheetCSVUrl(sheetId, 'teams');
      const playersUrl = getGSheetCSVUrl(sheetId, 'players');
      const matchesUrl = getGSheetCSVUrl(sheetId, 'matches');
      
      console.log("URLs générées pour les onglets:", { teamsUrl, playersUrl, matchesUrl });
      
      const teamsResults = await parseCSVFromURL(teamsUrl);
      console.log(`Données des équipes chargées: ${teamsResults.data.length} lignes`);
      
      const playersResults = await parseCSVFromURL(playersUrl);
      console.log(`Données des joueurs chargées: ${playersResults.data.length} lignes`);
      
      const matchesResults = await parseCSVFromURL(matchesUrl);
      console.log(`Données des matchs chargées: ${matchesResults.data.length} lignes`);
      
      const teams = convertTeamData(teamsResults.data as TeamCSV[]);
      const players = convertPlayerData(playersResults.data as PlayerCSV[]);
      const matches = convertMatchData(matchesResults.data as MatchCSV[], teams);
      
      console.log("Données converties:", { 
        teams: teams.length, 
        players: players.length, 
        matches: matches.length
      });
      
      teams.forEach(team => {
        team.players = players.filter(player => player.team === team.id);
      });
      
      loadedTeams = teams;
      loadedPlayers = players;
      loadedMatches = matches;
      
      await saveToDatabase({ teams, players, matches });
      
      return { teams, players, matches };
    }
  } catch (error) {
    console.error('Erreur lors du chargement des données Google Sheets:', error);
    throw error;
  }
};

// Fonction principale pour charger les fichiers CSV
export const loadCsvData = async (
  teamFile: File,
  playerFile: File, 
  matchFile: File
): Promise<{
  teams: Team[];
  players: Player[];
  matches: Match[];
}> => {
  try {
    const teamResults = await parseCSVFile(teamFile);
    const playerResults = await parseCSVFile(playerFile);
    const matchResults = await parseCSVFile(matchFile);
    
    console.log("Données CSV chargées:", {
      teams: teamResults.data.length,
      players: playerResults.data.length,
      matches: matchResults.data.length
    });
    
    const teams = convertTeamData(teamResults.data as TeamCSV[]);
    const players = convertPlayerData(playerResults.data as PlayerCSV[]);
    const matches = convertMatchData(matchResults.data as MatchCSV[], teams);
    
    console.log("Données converties:", {
      teams: teams.length,
      players: players.length,
      matches: matches.length
    });
    
    teams.forEach(team => {
      team.players = players.filter(player => player.team === team.id);
    });
    
    loadedTeams = teams;
    loadedPlayers = players;
    loadedMatches = matches;
    
    await saveToDatabase({ teams, players, matches });
    
    return { teams, players, matches };
  } catch (error) {
    console.error('Erreur lors du chargement des données CSV:', error);
    throw error;
  }
};

// Fonctions pour récupérer les données depuis Supabase
export const getTeams = async (): Promise<Team[]> => {
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
      winRate: team.win_rate as number,
      blueWinRate: team.blue_win_rate as number,
      redWinRate: team.red_win_rate as number,
      averageGameTime: team.average_game_time as number,
      players: []
    }));
    
    if (playersData) {
      teams.forEach(team => {
        team.players = playersData
          .filter(player => player.team_id === team.id)
          .map(player => ({
            id: player.id as string,
            name: player.name as string,
            role: player.role as 'Top' | 'Jungle' | 'Mid' | 'ADC' | 'Support',
            image: player.image as string,
            team: player.team_id as string,
            kda: player.kda as number,
            csPerMin: player.cs_per_min as number,
            damageShare: player.damage_share as number,
            championPool: player.champion_pool as string[] || []
          }));
      });
    }
    
    loadedTeams = teams;
    return teams;
  } catch (error) {
    console.error("Erreur lors de la récupération des équipes:", error);
    const { teams } = await import('./mockData');
    return teams;
  }
};

export const getPlayers = async (): Promise<Player[]> => {
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
      role: player.role as 'Top' | 'Jungle' | 'Mid' | 'ADC' | 'Support',
      image: player.image as string,
      team: player.team_id as string,
      kda: player.kda as number,
      csPerMin: player.cs_per_min as number,
      damageShare: player.damage_share as number,
      championPool: player.champion_pool as string[] || []
    }));
    
    loadedPlayers = players;
    return players;
  } catch (error) {
    console.error("Erreur lors de la récupération des joueurs:", error);
    const { teams } = await import('./mockData');
    return teams.flatMap(team => team.players);
  }
};

export const getMatches = async (): Promise<Match[]> => {
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
        blueWinOdds: match.blue_win_odds as number,
        redWinOdds: match.red_win_odds as number,
        status: match.status as 'Upcoming' | 'Live' | 'Completed'
      };
      
      if (match.status === 'Completed' && match.winner_team_id) {
        matchObject.result = {
          winner: match.winner_team_id as string,
          score: [match.score_blue || 0, match.score_red || 0],
          duration: match.duration as string | undefined,
          mvp: match.mvp as string | undefined,
          firstBlood: match.first_blood as string | undefined,
          firstDragon: match.first_dragon as string | undefined,
          firstBaron: match.first_baron as string | undefined
        };
      }
      
      return matchObject;
    });
    
    loadedMatches = matches;
    return matches;
  } catch (error) {
    console.error("Erreur lors de la récupération des matchs:", error);
    const { matches } = await import('./mockData');
    return matches;
  }
};

export const getTournaments = async (): Promise<Tournament[]> => {
  if (loadedTournaments) return loadedTournaments;
  
  try {
    const { data: matchesData, error: matchesError } = await supabase
      .from('matches')
      .select('tournament')
      .order('tournament');
    
    if (matchesError || !matchesData || matchesData.length === 0) {
      console.error("Erreur lors de la récupération des tournois:", matchesError);
      const { tournaments } = await import('./mockData');
      return tournaments;
    }
    
    const uniqueTournaments = [...new Set(matchesData.map(match => match.tournament as string))];
    
    const tournaments: Tournament[] = uniqueTournaments
      .filter(Boolean)
      .map(name => ({
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name,
        logo: `/tournaments/${name.toLowerCase().replace(/\s+/g, '-')}.png`,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
        region: 'Global'
      }));
    
    loadedTournaments = tournaments;
    return tournaments;
  } catch (error) {
    console.error("Erreur lors de la récupération des tournois:", error);
    const { tournaments } = await import('./mockData');
    return tournaments;
  }
};

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
