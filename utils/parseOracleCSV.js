const axios = require("axios");
const Papa = require("papaparse");

module.exports = async function parseCSV(fileUrl) {
  const response = await axios.get(fileUrl, {
    responseType: "blob",
    headers: { Accept: "text/csv" },
    maxRedirects: 5,
  });

  return new Promise((resolve, reject) => {
    Papa.parse(response.data, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data);
      },
      error: (err) => reject(err),
    });
  });
};
