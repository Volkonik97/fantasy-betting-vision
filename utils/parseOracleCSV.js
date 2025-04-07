import Papa from 'papaparse'
import axios from 'axios'

export const fetchCSVAndParse = async (url) => {
  const response = await axios.get(url)
  const csv = response.data

  return new Promise((resolve, reject) => {
    Papa.parse(csv, {
      header: true,
      skipEmptyLines: true,
      complete: results => {
        const data = results.data.map(row =>
          Object.fromEntries(Object.entries(row).map(([key, value]) => [
            key.trim(),
            value === 'NaN' || value === '' ? null : value
          ]))
        )
        resolve(data)
      },
      error: error => reject(error)
    })
  })
}
