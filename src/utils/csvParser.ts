
import Papa, { ParseResult } from 'papaparse';

// Utility functions for parsing CSV files
export const parseCSVFile = (file: File): Promise<ParseResult<any>> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false, // Keep everything as strings to avoid data loss
      complete: (results) => {
        resolve(results);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

// Function to parse CSV from URL
export const parseCSVFromURL = (url: string): Promise<ParseResult<any>> => {
  return new Promise((resolve, reject) => {
    Papa.parse(url, {
      download: true,
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false, // Keep everything as strings to avoid data loss
      complete: (results) => {
        console.log(`CSV parsing complete, found ${results.data.length} rows`);
        resolve(results);
      },
      error: (error) => {
        console.error("CSV parsing error:", error);
        reject(error);
      },
      // Ensure we get all data
      download_limit: 0, // No limit
      worker: true, // Use worker thread for better performance with large files
      delimiter: ",", // Explicitly set delimiter
      newline: "\n" // Explicitly set newline
    });
  });
};

// Function to extract Google Sheet ID from URL
export const extractSheetId = (url: string): string => {
  const regex = /\/d\/([a-zA-Z0-9-_]+)/;
  const match = url.match(regex);
  if (match && match[1]) {
    return match[1];
  }
  throw new Error("Format d'URL Google Sheets invalide");
};

// Function to get CSV URL from Google Sheet ID
export const getGSheetCSVUrl = (sheetId: string, sheetName: string = ''): string => {
  if (sheetName) {
    return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
  }
  // Using the direct export URL to ensure we get all data
  return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
};
