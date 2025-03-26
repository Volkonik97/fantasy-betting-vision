
import { loadedTeams, loadedPlayers, loadedMatches, loadedTournaments } from './csvTypes';
import { parseCSVFromURL, extractSheetId, getGSheetCSVUrl } from './csvParser';
import { processLeagueData } from './leagueDataProcessor';
import { convertTeamData, convertPlayerData, convertMatchData } from './dataConverter';
import { TeamCSV, PlayerCSV, MatchCSV } from './csvTypes';
import { saveToDatabase } from './databaseService';

// Function to load data from a single Google Sheet (Oracle's Elixir format)
export const loadFromSingleGoogleSheet = async (sheetUrl: string) => {
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
    
    const data = processLeagueData(results.data as any);
    
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

// Function to load data from multiple sheets in a Google Sheet
export const loadFromGoogleSheets = async (sheetUrl: string) => {
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
