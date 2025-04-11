// 📁 scripts/updateRawOracleMatches.js

import axios from 'axios'
import Papa from 'papaparse'
import { insertRawOracleRows, getExistingMatchIds } from '../utils/supabaseClient.js'
import { logInfo, logError } from '../utils/logger.js'

const GOOGLE_FILE_URL = process.env.GOOGLE_FILE_URL

const cleanRow = row => {
  const cleaned = {}
  for (const key in row) {
    const value = row[key]
    cleaned[key] = value === '' ? null : value
  }
  return cleaned
}

const run = async () => {
  try {
    logInfo('🔄 Mise à jour de la table raw_oracle_matches...')
    logInfo(`🌍 Téléchargement du CSV depuis : ${GOOGLE_FILE_URL}`)

    if (!GOOGLE_FILE_URL || !/^https?:\/\//.test(GOOGLE_FILE_URL)) {
      throw new Error(`URL invalide ou absente : "${GOOGLE_FILE_URL}"`)
    }

    const response = await axios.get(GOOGLE_FILE_URL)
    const csvData = response.data

    const parsed = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true
    }).data

    logInfo(`📄 ${parsed.length} lignes extraites du CSV.`)

    const cleanedRows = parsed.map(cleanRow)

    const knownGameIds = await getExistingMatchIds()
    const newRows = cleanedRows.filter(row => !knownGameIds.includes(row.gameid))

    logInfo(`🆕 ${newRows.length} nouvelles lignes à insérer.`)

    if (newRows.length > 0) {
      await insertRawOracleRows(newRows)
      logInfo('✅ Nouvelles lignes insérées dans raw_oracle_matches.')
    } else {
      logInfo('📭 Aucune ligne nouvelle à insérer.')
    }

  } catch (error) {
    logError(`❌ Erreur updateRawOracleMatches : ${error.message}`)
  }
}

run()
