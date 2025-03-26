
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
    
    return data && data.count > 0;
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
    
    return data ? data.updated_at : null;
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
    await supabase.from('data_updates').insert([{}]);
    
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
    // Vider d'abord la base de données
    await clearDatabase();
    
    // Insérer les équipes
    const { error: teamsError } = await supabase.from('teams').insert(
      data.teams.map(team => ({
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
    
    // Insérer les joueurs
    const { error: playersError } = await supabase.from('players').insert(
      data.players.map(player => ({
        id: player.id,
        name: player.name,
        role: player.role,
        image: player.image,
        team_id: player.team,
        kda: player.kda,
        cs_per_min: player.csPerMin,
        damage_share: player.damageShare,
        champion_pool: player.championPool
      }))
    );
    
    if (playersError) {
      console.error("Erreur lors de l'insertion des joueurs:", playersError);
      return false;
    }
    
    // Insérer les matchs
    const { error: matchesError } = await supabase.from('matches').insert(
      data.matches.map(match => ({
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
    
    // Ajouter une entrée dans la table des mises à jour
    await supabase.from('data_updates').insert([{}]);
    
    console.log("Données sauvegardées dans Supabase");
    return true;
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des données:", error);
    return false;
  }
};

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
    winRate: parseFloat(team.winRate),
    blueWinRate: parseFloat(team.blueWinRate),
    redWinRate: parseFloat(team.redWinRate),
    averageGameTime: parseFloat(team.averageGameTime),
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
    kda: parseFloat(player.kda),
    csPerMin: parseFloat(player.csPerMin),
    damageShare: parseFloat(player.damageShare),
    championPool: player.championPool.split(',').map(champ => champ.trim())
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
      blueWinOdds: parseFloat(match.blueWinOdds),
      redWinOdds: parseFloat(match.redWinOdds),
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
    return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${sheetName}`;
  }
  return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`;
};

// Fonction pour transformer les données LOL en format attendu par l'application
export const processLeagueData = (data: LeagueGameDataRow[]): {
  teams: Team[];
  players: Player[];
  matches: Match[];
} => {
  const uniqueTeams = new Map<string, TeamCSV>();
  data.forEach(row => {
    if (!uniqueTeams.has(row.teamid)) {
      uniqueTeams.set(row.teamid, {
        id: row.teamid,
        name: row.teamname,
        logo: '',
        region: row.league,
        winRate: '0',
        blueWinRate: '0',
        redWinRate: '0',
        averageGameTime: '0'
      });
    }
  });

  const teamStats = new Map<string, { wins: number, losses: number, blueWins: number, blueLosses: number, redWins: number, redLosses: number, gameTimes: number[] }>();
  data.forEach(row => {
    const teamId = row.teamid;
    if (!teamStats.has(teamId)) {
      teamStats.set(teamId, { wins: 0, losses: 0, blueWins: 0, blueLosses: 0, redWins: 0, redLosses: 0, gameTimes: [] });
    }
    
    const stats = teamStats.get(teamId)!;
    const isWin = row.result === '1';
    const gameLength = parseFloat(row.gamelength);
    
    if (isWin) stats.wins++;
    else stats.losses++;
    
    if (row.side === 'Blue') {
      if (isWin) stats.blueWins++;
      else stats.blueLosses++;
    } else {
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
    if (!uniquePlayers.has(row.playerid)) {
      uniquePlayers.set(row.playerid, {
        id: row.playerid,
        name: row.playername,
        role: row.position,
        image: '',
        team: row.teamid,
        kda: '0',
        csPerMin: '0',
        damageShare: '0',
        championPool: ''
      });
    }
  });

  const playerStats = new Map<string, { kills: number, deaths: number, assists: number, games: number, cs: number, championsPlayed: Set<string> }>();
  data.forEach(row => {
    const playerId = row.playerid;
    if (!playerStats.has(playerId)) {
      playerStats.set(playerId, { kills: 0, deaths: 0, assists: 0, games: 0, cs: 0, championsPlayed: new Set() });
    }
    
    const stats = playerStats.get(playerId)!;
    stats.kills += parseInt(row.kills) || 0;
    stats.deaths += parseInt(row.deaths) || 0;
    stats.assists += parseInt(row.assists) || 0;
    stats.games++;
    
    const minionKills = parseInt(row.minionkills) || 0;
    const monsterKills = parseInt(row.monsterkills) || 0;
    stats.cs += minionKills + monsterKills;
    
    stats.championsPlayed.add(row.champion);
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

  const uniqueMatches = new Map<string, { 
    gameId: string, 
    date: string, 
    teams: { blue: string, red: string },
    result?: string,
    duration?: string
  }>();
  
  data.forEach(row => {
    const gameId = row.gameid;
    if (!uniqueMatches.has(gameId)) {
      uniqueMatches.set(gameId, { 
        gameId,
        date: row.date,
        teams: { 
          blue: '', 
          red: '' 
        }
      });
    }
    
    const match = uniqueMatches.get(gameId)!;
    if (row.side === 'Blue') {
      match.teams.blue = row.teamid;
    } else if (row.side === 'Red') {
      match.teams.red = row.teamid;
    }
    
    match.duration = row.gamelength;
    
    if (row.result === '1') {
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
  
  const matchesArray: MatchCSV[] = Array.from(uniqueMatches.values()).map(match => {
    const tournamentName = `${data[0]?.league || 'Unknown'} ${data[0]?.year || ''} ${data[0]?.split || ''}`;
    
    const matchCSV: MatchCSV = {
      id: match.gameId,
      tournament: tournamentName,
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
    const sheetId = extractSheetId(sheetUrl);
    
    const csvUrl = getGSheetCSVUrl(sheetId);
    
    const results = await parseCSVFromURL(csvUrl);
    
    const data = processLeagueData(results.data as LeagueGameDataRow[]);
    
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
    const sheetId = extractSheetId(sheetUrl);
    
    try {
      return await loadFromSingleGoogleSheet(sheetUrl);
    } catch (error) {
      console.log("Essai du format à onglets multiples...");
      
      const teamsUrl = getGSheetCSVUrl(sheetId, 'teams');
      const playersUrl = getGSheetCSVUrl(sheetId, 'players');
      const matchesUrl = getGSheetCSVUrl(sheetId, 'matches');
      
      const teamsResults = await parseCSVFromURL(teamsUrl);
      const playersResults = await parseCSVFromURL(playersUrl);
      const matchesResults = await parseCSVFromURL(matchesUrl);
      
      const teams = convertTeamData(teamsResults.data as TeamCSV[]);
      const players = convertPlayerData(playersResults.data as PlayerCSV[]);
      const matches = convertMatchData(matchesResults.data as MatchCSV[], teams);
      
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
    
    const teams = convertTeamData(teamResults.data as TeamCSV[]);
    const players = convertPlayerData(playerResults.data as PlayerCSV[]);
    const matches = convertMatchData(matchResults.data as MatchCSV[], teams);
    
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
    
    if (teamsError) {
      console.error("Erreur lors de la récupération des équipes:", teamsError);
      const { teams } = await import('./mockData');
      return teams;
    }
    
    if (!teamsData || teamsData.length === 0) {
      const { teams } = await import('./mockData');
      return teams;
    }
    
    const { data: playersData } = await supabase
      .from('players')
      .select('*');
    
    const teams: Team[] = teamsData.map(team => ({
      id: team.id,
      name: team.name,
      logo: team.logo,
      region: team.region,
      winRate: team.win_rate,
      blueWinRate: team.blue_win_rate,
      redWinRate: team.red_win_rate,
      averageGameTime: team.average_game_time,
      players: []
    }));
    
    if (playersData) {
      teams.forEach(team => {
        team.players = playersData
          .filter(player => player.team_id === team.id)
          .map(player => ({
            id: player.id,
            name: player.name,
            role: player.role as 'Top' | 'Jungle' | 'Mid' | 'ADC' | 'Support',
            image: player.image,
            team: player.team_id,
            kda: player.kda,
            csPerMin: player.cs_per_min,
            damageShare: player.damage_share,
            championPool: player.champion_pool || []
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
    
    if (playersError) {
      console.error("Erreur lors de la récupération des joueurs:", playersError);
      const { teams } = await import('./mockData');
      return teams.flatMap(team => team.players);
    }
    
    if (!playersData || playersData.length === 0) {
      const { teams } = await import('./mockData');
      return teams.flatMap(team => team.players);
    }
    
    const players: Player[] = playersData.map(player => ({
      id: player.id,
      name: player.name,
      role: player.role as 'Top' | 'Jungle' | 'Mid' | 'ADC' | 'Support',
      image: player.image,
      team: player.team_id,
      kda: player.kda,
      csPerMin: player.cs_per_min,
      damageShare: player.damage_share,
      championPool: player.champion_pool || []
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
    
    if (matchesError) {
      console.error("Erreur lors de la récupération des matchs:", matchesError);
      const { matches } = await import('./mockData');
      return matches;
    }
    
    if (!matchesData || matchesData.length === 0) {
      const { matches } = await import('./mockData');
      return matches;
    }
    
    const teams = await getTeams();
    
    const matches: Match[] = matchesData.map(match => {
      const teamBlue = teams.find(t => t.id === match.team_blue_id) || teams[0];
      const teamRed = teams.find(t => t.id === match.team_red_id) || teams[1];
      
      const matchObject: Match = {
        id: match.id,
        tournament: match.tournament,
        date: match.date,
        teamBlue,
        teamRed,
        predictedWinner: match.predicted_winner,
        blueWinOdds: match.blue_win_odds,
        redWinOdds: match.red_win_odds,
        status: match.status as 'Upcoming' | 'Live' | 'Completed'
      };
      
      if (match.status === 'Completed' && match.winner_team_id) {
        matchObject.result = {
          winner: match.winner_team_id,
          score: [match.score_blue || 0, match.score_red || 0],
          duration: match.duration,
          mvp: match.mvp,
          firstBlood: match.first_blood,
          firstDragon: match.first_dragon,
          firstBaron: match.first_baron
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
    const { data: matchesData } = await supabase
      .from('matches')
      .select('tournament')
      .order('tournament');
    
    if (!matchesData || matchesData.length === 0) {
      const { tournaments } = await import('./mockData');
      return tournaments;
    }
    
    const uniqueTournaments = [...new Set(matchesData.map(match => match.tournament))];
    
    const tournaments: Tournament[] = uniqueTournaments.map(name => ({
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
