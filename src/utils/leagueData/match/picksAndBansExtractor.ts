
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
    
    // Tableau des positions pour associer les picks aux rôles
    const positions = ['Top', 'Jungle', 'Mid', 'ADC', 'Support'];
    
    // Extraire les données de picks de manière plus efficace
    const blueTeamRows = rows.filter(row => row.side && row.side.toLowerCase() === 'blue');
    const redTeamRows = rows.filter(row => row.side && row.side.toLowerCase() === 'red');
    
    // Log pour le débogage
    console.log(`Extraction des picks et bans: ${blueTeamRows.length} joueurs bleus, ${redTeamRows.length} joueurs rouges`);
    
    // Traiter d'abord les picks des joueurs (plus précis)
    processTeamPlayerPicks(blueTeamRows, picks, 'blue');
    processTeamPlayerPicks(redTeamRows, picks, 'red');
    
    // Si certains picks ne sont pas trouvés via les joueurs,
    // essayer de les extraire via les colonnes pick1, pick2, etc.
    processTeamColumnPicks(blueTeamRows, picks, 'blue');
    processTeamColumnPicks(redTeamRows, picks, 'red');
    
    // Extraire les bans
    const bans: { [key: string]: { championId: string; championName?: string } } = {};
    processBans(blueTeamRows, bans, 'blue');
    processBans(redTeamRows, bans, 'red');
    
    // Vérifier si nous avons des données pour retourner
    const hasPicksData = Object.keys(picks).length > 0;
    const hasBansData = Object.keys(bans).length > 0;
    
    if (hasPicksData) {
      console.log(`Picks extraits:`, Object.keys(picks));
    }
    
    if (hasBansData) {
      console.log(`Bans extraits:`, Object.keys(bans));
    }
    
    return {
      picks: hasPicksData ? picks : undefined,
      bans: hasBansData ? bans : undefined
    };
    
  } catch (error) {
    console.error("Erreur lors de l'extraction des picks et bans:", error);
    return { picks: undefined, bans: undefined };
  }
}

/**
 * Process picks from individual player rows
 */
function processTeamPlayerPicks(
  teamRows: LeagueGameDataRow[],
  picks: { [key: string]: { championId: string; championName?: string; role?: string; playerName?: string } },
  teamPrefix: 'blue' | 'red'
) {
  // Traiter chaque joueur individuellement
  teamRows.forEach(row => {
    if (row.position && row.champion && row.playername) {
      const position = row.position.trim();
      const champName = row.champion.trim();
      
      // Créer une clé unique pour ce pick
      const pickKey = `${teamPrefix}_${position.toLowerCase()}`;
      
      picks[pickKey] = {
        championId: champName,
        championName: champName,
        role: position,
        playerName: row.playername
      };
    }
  });
}

/**
 * Process picks from pick1, pick2, etc. columns
 */
function processTeamColumnPicks(
  teamRows: LeagueGameDataRow[],
  picks: { [key: string]: { championId: string; championName?: string; role?: string; playerName?: string } },
  teamPrefix: 'blue' | 'red'
) {
  // Positions standard
  const positions = ['Top', 'Jungle', 'Mid', 'ADC', 'Support'];
  
  // Utiliser la première ligne qui contient des données de picks
  const pickRow = teamRows.find(row => {
    return row.pick1 || row.pick2 || row.pick3 || row.pick4 || row.pick5;
  });
  
  if (!pickRow) return;
  
  // Extraire les picks des colonnes pick1, pick2, etc.
  for (let i = 1; i <= 5; i++) {
    const pickKey = `pick${i}` as keyof LeagueGameDataRow;
    if (pickRow[pickKey] && typeof pickRow[pickKey] === 'string') {
      const champName = pickRow[pickKey] as string;
      const role = positions[i - 1] || `Position${i}`;
      
      const fullPickKey = `${teamPrefix}_${role.toLowerCase()}`;
      
      // N'ajouter que si ce pick n'a pas déjà été ajouté
      if (!picks[fullPickKey]) {
        picks[fullPickKey] = {
          championId: champName,
          championName: champName,
          role: role
        };
      }
    }
  }
}

/**
 * Process bans from ban1, ban2, etc. columns
 */
function processBans(
  teamRows: LeagueGameDataRow[],
  bans: { [key: string]: { championId: string; championName?: string } },
  teamPrefix: 'blue' | 'red'
) {
  // Utiliser la première ligne qui contient des données de bans
  const banRow = teamRows.find(row => {
    return row.ban1 || row.ban2 || row.ban3 || row.ban4 || row.ban5;
  });
  
  if (!banRow) return;
  
  // Extraire les bans
  for (let i = 1; i <= 5; i++) {
    const banKey = `ban${i}` as keyof LeagueGameDataRow;
    if (banRow[banKey] && typeof banRow[banKey] === 'string') {
      const champName = banRow[banKey] as string;
      
      // Créer une clé unique pour ce ban
      const fullBanKey = `${teamPrefix}_ban${i}`;
      
      bans[fullBanKey] = {
        championId: champName,
        championName: champName
      };
    }
  }
}
