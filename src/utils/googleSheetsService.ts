import axios from 'axios';
import Papa from 'papaparse';
import { parseCSVFromURL, extractSheetId, getGSheetCSVUrl } from './csvParser';
import { LeagueGameDataRow } from './csvTypes';
import { processLeagueData } from './leagueDataProcessor';
import { hasDatabaseData, clearDatabase, saveToDatabase } from './database/databaseService';
import { toast } from 'sonner';

// Define a progress callback type
type ProgressCallback = (step: string, progress: number) => void;

// Load data from Google Sheets
export const loadFromGoogleSheets = async (
  sheetUrl: string,
  deleteExisting: boolean = false,
  progressCallback?: ProgressCallback
) => {
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
    progressCallback?.("Préparation", 15);
    
    // Get CSV URL and parse the data
    const csvUrl = getGSheetCSVUrl(sheetId);
    
    console.log("Fetching data from URL:", csvUrl);
    
    // Set up complete config for CSV parsing to ensure we get all rows
    const csvResult = await new Promise<Papa.ParseResult<any>>((resolve, reject) => {
      Papa.parse(csvUrl, {
        download: true,
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false, // Keep everything as strings to avoid data loss
        complete: (result) => {
          console.log(`Papa parse complete with ${result.data.length} rows`);
          resolve(result);
        },
        error: (error) => {
          console.error("Papa parse error:", error);
          reject(error);
        },
        // Set a generous limit to ensure we get all rows
        worker: false, // Disable worker to avoid timeouts with large files
        delimiter: ",", // Explicitly set delimiter
        newline: "\n", // Explicitly set newline
        fastMode: false, // Disable fast mode for more reliable parsing
        chunkSize: 100000, // Increase chunk size for better performance
        beforeFirstChunk: (chunk) => {
          console.log("Received first chunk");
          return chunk;
        }
      });
    });
    
    // Access the data array from the ParseResult
    const csvData = csvResult.data;
    
    if (!csvData || csvData.length === 0) {
      console.error("Aucune donnée n'a pu être récupérée depuis Google Sheets");
      toast.error("Aucune donnée n'a pu être récupérée");
      return false;
    }
    
    console.log(`${csvData.length} lignes de données chargées depuis Google Sheets`);
    toast.info(`${csvData.length} lignes de données chargées`);
    progressCallback?.("Données chargées", 30);
    
    // If we need to delete existing data before inserting new data
    if (deleteExisting) {
      console.log("Suppression des données existantes...");
      progressCallback?.("Suppression des données existantes", 35);
      const clearResult = await clearDatabase();
      if (!clearResult) {
        console.error("Échec de la suppression des données existantes");
        toast.error("Échec de la suppression des données existantes");
        return false;
      }
      console.log("Données existantes supprimées avec succès");
      progressCallback?.("Données supprimées", 40);
    }
    
    // Process the data into our application format
    progressCallback?.("Traitement des données", 45);
    const processedData = processLeagueData(csvData as LeagueGameDataRow[]);
    
    if (processedData.teams.length === 0 || processedData.players.length === 0) {
      console.error("Le traitement des données n'a pas généré d'équipes ou de joueurs");
      toast.error("Erreur lors du traitement des données");
      return false;
    }
    
    console.log("Données traitées:", {
      teamsCount: processedData.teams.length,
      playersCount: processedData.players.length,
      matchesCount: processedData.matches.length,
      playerStatsCount: processedData.playerMatchStats.length
    });
    progressCallback?.("Traitement terminé", 50);
    
    // Keep track of player stats count for accurate progress
    const totalPlayerStats = processedData.playerMatchStats.length;
    console.log(`Total player match stats to save: ${totalPlayerStats}`);
    
    // Save the processed data to Supabase in steps to show progress
    progressCallback?.("Enregistrement des équipes", 55);
    const saveResult = await saveToDatabase(processedData, (phase, percent) => {
      let totalProgress = 0;
      
      // Map the database phase to an overall progress percentage
      switch (phase) {
        case 'teams':
          totalProgress = 55 + percent * 0.1; // 55-65%
          progressCallback?.("Enregistrement des équipes", totalProgress);
          break;
        case 'players':
          totalProgress = 65 + percent * 0.1; // 65-75%
          progressCallback?.("Enregistrement des joueurs", totalProgress);
          break;
        case 'matches':
          totalProgress = 75 + percent * 0.05; // 75-80%
          progressCallback?.("Enregistrement des matchs", totalProgress);
          break;
        case 'playerStats':
          totalProgress = 80 + percent * 0.2; // 80-100% - give more weight to player stats
          progressCallback?.(`Enregistrement des statistiques (${Math.floor(percent * totalPlayerStats / 100)} sur ${totalPlayerStats})`, totalProgress);
          break;
      }
    });
    
    if (saveResult) {
      progressCallback?.("Importation terminée", 100);
      toast.success(`Données importées avec succès: ${processedData.teams.length} équipes, ${processedData.players.length} joueurs, ${processedData.matches.length} matchs, ${processedData.playerMatchStats.length} statistiques`);
      return processedData; // Return the processed data instead of boolean
    } else {
      toast.error("Erreur lors de la sauvegarde des données");
      return false;
    }
  } catch (error) {
    console.error("Erreur lors du chargement des données depuis Google Sheets:", error);
    toast.error(`Erreur lors du chargement des données: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    return false;
  }
};
