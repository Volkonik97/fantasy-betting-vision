const parseCSV = require("./utils/parseOracleCSV");
const { insertData } = require("./utils/supabaseClient");
const { log, error } = require("./utils/logger");

(async () => {
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
})();
