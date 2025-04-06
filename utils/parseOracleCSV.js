import axios from "axios";
import Papa from "papaparse";

export default async function parseCSV(fileUrl) {
  const response = await axios.get(fileUrl, {
    responseType: "blob",
    headers: { Accept: "text/csv" },
    maxRedirects: 5,
  });

  return new Promise((resolve, reject) => {
    Papa.parse(response.data, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
      error: (err) => reject(err),
    });
  });
}
