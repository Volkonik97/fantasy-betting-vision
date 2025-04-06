import parseCSV from "./utils/parseOracleCSV.js";
import { insertData } from "./utils/supabaseClient.js";
import { log, error } from "./utils/logger.js";

try {
  log("🟡 Démarrage de l'import automatique depuis Google Sheet...");

  const rows = await parseCSV(process.env.GOOGLE_FILE_URL);

  if (!rows || rows.length === 0) {
    throw new Error("Aucune donnée récupérée depuis le fichier Google Sheet.");
  }

  await insertData(rows);

  log("✅ Import terminé avec succès !");
} catch (err) {
  error("❌ Erreur lors de l'import :", err.message);
  process.exit(1);
}
