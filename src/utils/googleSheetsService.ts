
import axios from 'axios';
import Papa from 'papaparse';
import { parseCSVFromURL, extractSheetId, getGSheetCSVUrl } from './csvParser';
import { LeagueGameDataRow } from './csvTypes';
import { processLeagueData } from './leagueDataProcessor';
import { hasDatabaseData, clearDatabase, saveToDatabase } from './database/databaseService';
import { toast } from 'sonner';

// Load data from Google Sheets
export const loadFromGoogleSheets = async (
  sheetUrl: string,
  deleteExisting: boolean = false
): Promise<boolean> => {
  try {
    if (!sheetUrl) {
      console.error("URL de feuille Google Sheets non fournie");
      toast.error("Veuillez fournir une URL de feuille Google Sheets");
      return false;
    }
    
    // If we already have data and don't want to delete it, return early
    if (!deleteExisting && await hasDatabaseData()) {
      toast.error("Des données existent déjà dans la base de données. Cochez 'Supprimer les données existantes' pour continuer.");
      return false;
    }
    
    // Extract the Google Sheet ID
    const sheetId = extractSheetId(sheetUrl);
    if (!sheetId) {
      console.error("Impossible d'extraire l'ID de la feuille Google");
      toast.error("URL de feuille Google Sheets invalide");
      return false;
    }
    
    toast.info("Chargement des données depuis Google Sheets...");
    
    // Get CSV URL and parse the data
    const csvUrl = getGSheetCSVUrl(sheetId);
    const csvData = await parseCSVFromURL(csvUrl);
    
    if (!csvData || csvData.length === 0) {
      console.error("Aucune donnée n'a pu être récupérée depuis Google Sheets");
      toast.error("Aucune donnée n'a pu être récupérée");
      return false;
    }
    
    console.log(`${csvData.length} lignes de données chargées depuis Google Sheets`);
    
    // Process the data into our application format
    const processedData = processLeagueData(csvData as LeagueGameDataRow[]);
    
    if (processedData.teams.length === 0 || processedData.players.length === 0) {
      console.error("Le traitement des données n'a pas généré d'équipes ou de joueurs");
      toast.error("Erreur lors du traitement des données");
      return false;
    }
    
    console.log("Données traitées:", {
      teamsCount: processedData.teams.length,
      playersCount: processedData.players.length,
      matchesCount: processedData.matches.length
    });
    
    // If we need to delete existing data before inserting new data
    if (deleteExisting) {
      await clearDatabase();
    }
    
    // Save the processed data to Supabase
    const saveResult = await saveToDatabase(processedData);
    
    if (saveResult) {
      toast.success("Données importées avec succès");
      return true;
    } else {
      toast.error("Erreur lors de la sauvegarde des données");
      return false;
    }
  } catch (error) {
    console.error("Erreur lors du chargement des données depuis Google Sheets:", error);
    toast.error("Erreur lors du chargement des données");
    return false;
  }
};
