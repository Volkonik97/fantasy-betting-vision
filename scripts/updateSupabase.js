
const axios = require('axios');
const Papa = require('papaparse');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Récupérer les variables d'environnement
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const GOOGLE_FILE_ID = process.env.GOOGLE_FILE_ID || '17G8ainh2efXGPAlPYQKj0NCji4hh9qhj41A8LbrlzuE';

// Initialiser le client Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Fonction pour extraire le Google Sheet ID d'une URL
const getGSheetCSVUrl = (fileId) => {
  return `https://docs.google.com/spreadsheets/d/${fileId}/export?format=csv`;
};

// Fonction pour analyser les données CSV depuis une URL
const parseCSVFromURL = async (url) => {
  try {
    console.log(`Récupération des données depuis: ${url}`);
    const response = await axios.get(url, {
      responseType: 'text',
      timeout: 30000, // Augmenter le timeout pour les grands fichiers
    });
    
    return new Promise((resolve, reject) => {
      Papa.parse(response.data, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false,
        complete: (results) => {
          console.log(`Analyse CSV terminée, ${results.data.length} lignes trouvées`);
          resolve(results.data);
        },
        error: (error) => {
          console.error("Erreur lors de l'analyse CSV:", error);
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du fichier CSV:", error);
    throw error;
  }
};

// Fonction pour traiter les données et les importer dans Supabase
const importDataToSupabase = async (data) => {
  try {
    // Importer à l'aide des fonctions existantes
    const { processLeagueData } = require('../src/utils/leagueDataProcessor');
    const { clearDatabase, saveToDatabase } = require('../src/utils/database/databaseService');
    
    console.log(`Traitement de ${data.length} lignes de données...`);
    
    // Nettoyer d'abord la base de données
    console.log("Suppression des données existantes...");
    await clearDatabase();
    
    // Traiter les données
    console.log("Traitement des données...");
    const processedData = processLeagueData(data);
    
    // Vérifier les résultats du traitement
    if (processedData.teams.length === 0 || processedData.players.length === 0) {
      throw new Error("Le traitement des données n'a pas généré d'équipes ou de joueurs");
    }
    
    console.log(`Données traitées: ${processedData.teams.length} équipes, ${processedData.players.length} joueurs, ${processedData.matches.length} matchs, ${processedData.playerMatchStats.length} statistiques de joueur`);
    
    // Sauvegarder dans Supabase
    console.log("Enregistrement des données dans Supabase...");
    const saveResult = await saveToDatabase(processedData, (phase, percent, current, total) => {
      if (current && total) {
        console.log(`Phase: ${phase}, Progression: ${current}/${total} (${percent}%)`);
      } else {
        console.log(`Phase: ${phase}, Progression: ${percent}%`);
      }
    });
    
    if (saveResult) {
      console.log("Importation réussie!");
      return {
        success: true,
        stats: {
          teams: processedData.teams.length,
          players: processedData.players.length,
          matches: processedData.matches.length,
          playerStats: processedData.playerMatchStats.length,
          teamStats: processedData.teamMatchStats ? processedData.teamMatchStats.length : 0
        }
      };
    } else {
      throw new Error("Échec de l'enregistrement des données dans Supabase");
    }
  } catch (error) {
    console.error("Erreur lors de l'importation des données:", error);
    throw error;
  }
};

// Fonction principale
const main = async () => {
  try {
    console.log("Démarrage de la mise à jour automatique de la base de données...");
    
    // Obtenir l'URL CSV à partir de l'ID de fichier Google Sheets
    const csvUrl = getGSheetCSVUrl(GOOGLE_FILE_ID);
    
    // Récupérer et analyser les données
    const data = await parseCSVFromURL(csvUrl);
    
    // Importer les données dans Supabase
    const result = await importDataToSupabase(data);
    
    console.log("Mise à jour terminée avec succès:", result.stats);
    process.exit(0);
  } catch (error) {
    console.error("Erreur lors de la mise à jour:", error);
    process.exit(1);
  }
};

// Exécuter la fonction principale
main();
