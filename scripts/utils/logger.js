export const log = console.log;
export const logError = (msg) => console.error(`❌ ${msg}`);
export const logMatchIgnored = (gameid) => console.log(`🚫 Ignoré ${gameid} (Unknown Team détectée)`);
export const logMatchImported = (gameid) => console.log(`✅ Importé : ${gameid}`);
