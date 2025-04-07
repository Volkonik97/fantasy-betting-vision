import axios from 'axios'
import Papa from 'papaparse'
import { logInfo, logError } from './logger.js'

/**
 * Convertit les chaînes vides ou 'NaN' en null, et tente de convertir les nombres
 */
const cleanValue = (value) => {
  if (value === '' || value === 'NaN') return null
  if (!isNaN(value) && value.trim() !== '') return Number(value)
  return value
}

/**
 * Transforme une ligne du CSV en objet nettoyé
 */
const cleanRow = (row) => {
  const cleaned = {}
  for (const key in row) {
    cleaned[key.trim()] = cleanValue(row[key])
  }
  return cleaned
}

export const fetchCSVAndParse = async (url) => {
  try {
    logInfo(`⬇️ Téléchargement du CSV depuis : ${url}`)

    const response = await axios.get(url, {
      responseType: 'blob',
      maxRedirects: 5,
      headers: {
        'Accept': 'text/csv'
      }
    })

    const csvText = response.data
    const parsed = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true
    })

    if (parsed.errors.length > 0) {
      logError('❌ Erreurs pendant le parsing CSV :', parsed.errors)
      throw new Error('Parsing CSV échoué')
    }

    const cleanedRows = parsed.data.map(cleanRow)

    // Vérification des colonnes nécessaires
    const requiredColumns = ['gameid', 'teamid_1', 'teamid_2']
    const hasAllColumns = requiredColumns.every(col => col in cleanedRows[0])
    if (!hasAllColumns) {
      throw new Error(`Le fichier CSV doit contenir les colonnes : ${requiredColumns.join(', ')}`)
    }

    return cleanedRows
  } catch (err) {
    logError('❌ Erreur lors du téléchargement ou parsing du CSV :', err.message || err)
    throw err
  }
}
