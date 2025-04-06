const axios = require('axios');
const Papa = require('papaparse');

async function downloadAndParseCSV(fileId) {
  const url = `https://drive.google.com/uc?export=download&id=${fileId}`;

  const response = await axios.get(url, { responseType: 'stream' });
  return new Promise((resolve, reject) => {
    let csvData = '';

    response.data.on('data', chunk => csvData += chunk);
    response.data.on('end', () => {
      const parsed = Papa.parse(csvData, { header: true, skipEmptyLines: true });
      resolve(parsed.data);
    });
    response.data.on('error', err => reject(err));
  });
}

module.exports = { downloadAndParseCSV };
