
import { LeagueGameDataRow } from '../../csv/types';

/**
 * Extract picks and bans data from game rows
 */
export function extractPicksAndBans(rows: LeagueGameDataRow[]): {
  picks: any | undefined;
  bans: any | undefined;
} {
  // Vérification que les données sont disponibles
  if (!rows || rows.length === 0) {
    return { picks: undefined, bans: undefined };
  }

  try {
    // Créer l'objet picks
    const picks: { [key: string]: { championId: string; championName?: string; role?: string; playerName?: string } } = {};
    
    // Extraire les données de picks à partir des colonnes pick1, pick2, etc.
    rows.forEach(row => {
      if (row.side && row.playerid) {
        const teamPrefix = row.side.toLowerCase() === 'blue' ? 'blue' : 'red';
        const position = row.position || '';
        
        // Captures les données du champion joué par ce joueur
        if (row.champion) {
          picks[`${teamPrefix}_${position.toLowerCase()}`] = {
            championId: row.champion,
            championName: row.champion,
            role: position,
            playerName: row.playername || ''
          };
        }
        
        // Tentative d'extraction des picks spécifiques (pick1, pick2, etc.) si disponibles
        for (let i = 1; i <= 5; i++) {
          const pickKey = `pick${i}` as keyof LeagueGameDataRow;
          if (row[pickKey] && typeof row[pickKey] === 'string') {
            picks[`${teamPrefix}_pick${i}`] = {
              championId: row[pickKey] as string,
              championName: row[pickKey] as string,
              role: i === 1 ? 'Top' : i === 2 ? 'Jungle' : i === 3 ? 'Mid' : i === 4 ? 'ADC' : 'Support'
            };
          }
        }
      }
    });
    
    // Extraire les bans
    const bans: { [key: string]: { championId: string; championName?: string } } = {};
    rows.forEach(row => {
      if (row.side) {
        const teamPrefix = row.side.toLowerCase() === 'blue' ? 'blue' : 'red';
        
        // Extraire les bans (ban1, ban2, etc.)
        for (let i = 1; i <= 5; i++) {
          const banKey = `ban${i}` as keyof LeagueGameDataRow;
          if (row[banKey] && typeof row[banKey] === 'string') {
            bans[`${teamPrefix}_ban${i}`] = {
              championId: row[banKey] as string,
              championName: row[banKey] as string
            };
          }
        }
      }
    });
    
    // Vérifier si nous avons des données pour retourner
    const hasPicksData = Object.keys(picks).length > 0;
    const hasBansData = Object.keys(bans).length > 0;
    
    console.log(`Extraits pour le match: ${rows[0]?.gameid} - ${hasPicksData ? Object.keys(picks).length : 0} picks, ${hasBansData ? Object.keys(bans).length : 0} bans`);
    
    return {
      picks: hasPicksData ? picks : undefined,
      bans: hasBansData ? bans : undefined
    };
    
  } catch (error) {
    console.error("Erreur lors de l'extraction des picks et bans:", error);
    return { picks: undefined, bans: undefined };
  }
}
