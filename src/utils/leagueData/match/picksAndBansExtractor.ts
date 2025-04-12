
import { LeagueGameDataRow } from '../../csv/types';
import { PicksAndBans } from '../types';
import { prepareJsonData } from '../utils';

/**
 * Extract picks and bans data from game rows
 */
export function extractPicksAndBans(rows: LeagueGameDataRow[] | Set<LeagueGameDataRow>): {
  picks: any | undefined;
  bans: any | undefined;
} {
  // Convert Set to Array if needed
  const rowsArray = rows instanceof Set ? Array.from(rows) : rows;

  // Vérification que les données sont disponibles
  if (!rowsArray || rowsArray.length === 0) {
    return { picks: undefined, bans: undefined };
  }

  try {
    // Créer l'objet picks
    const picks: { [key: string]: { championId: string; championName?: string; role?: string; playerName?: string } } = {};
    
    // Tableau des positions pour associer les picks aux rôles
    const positions = ['Top', 'Jungle', 'Mid', 'ADC', 'Support'];
    
    // Extraire les données de picks de manière plus efficace
    const blueTeamRows = rowsArray.filter(row => row.side && row.side.toLowerCase() === 'blue');
    const redTeamRows = rowsArray.filter(row => row.side && row.side.toLowerCase() === 'red');
    
    // Log pour le débogage
    console.log(`Extraction des picks et bans: ${blueTeamRows.length} joueurs bleus, ${redTeamRows.length} joueurs rouges`);
    
    // Check if we have direct picks/bans data in JSON format
    const jsonPicksRow = rowsArray.find(row => row.picks && typeof row.picks === 'string');
    const jsonBansRow = rowsArray.find(row => row.bans && typeof row.bans === 'string');
    
    if (jsonPicksRow?.picks) {
      // Try to directly use JSON data if available
      try {
        const parsedPicks = prepareJsonData(jsonPicksRow.picks);
        if (parsedPicks && typeof parsedPicks === 'object') {
          console.log("Found direct JSON picks data");
          Object.assign(picks, parsedPicks);
          return {
            picks: picks,
            bans: jsonBansRow?.bans ? prepareJsonData(jsonBansRow.bans) : undefined
          };
        }
      } catch (e) {
        console.error("Error parsing picks JSON:", e);
      }
    }
    
    // Traiter d'abord les picks des joueurs (plus précis)
    processTeamPlayerPicks(blueTeamRows, picks, 'blue');
    processTeamPlayerPicks(redTeamRows, picks, 'red');
    
    // SPECIFIC PICK COLUMNS: Extract pick1, pick2, etc. columns directly
    // For Blue Team
    processDirectPickColumns(getFirstValidRow(blueTeamRows), picks, 'blue', positions);
    // For Red Team  
    processDirectPickColumns(getFirstValidRow(redTeamRows), picks, 'red', positions);
    
    // Extraire les bans
    const bans: { [key: string]: { championId: string; championName?: string } } = {};
    
    // Try the JSON first if available
    if (jsonBansRow?.bans) {
      try {
        const parsedBans = prepareJsonData(jsonBansRow.bans);
        if (parsedBans && typeof parsedBans === 'object') {
          console.log("Found direct JSON bans data");
          Object.assign(bans, parsedBans);
          return {
            picks: Object.keys(picks).length > 0 ? picks : undefined,
            bans: bans
          };
        }
      } catch (e) {
        console.error("Error parsing bans JSON:", e);
      }
    }
    
    // SPECIFIC BAN COLUMNS: Extract ban1, ban2, etc. columns directly
    // For Blue Team
    processDirectBanColumns(getFirstValidRow(blueTeamRows), bans, 'blue');
    // For Red Team
    processDirectBanColumns(getFirstValidRow(redTeamRows), bans, 'red');
    
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
 * Get first valid row from a team's rows
 */
function getFirstValidRow(teamRows: LeagueGameDataRow[]): LeagueGameDataRow | undefined {
  if (!teamRows || teamRows.length === 0) return undefined;
  return teamRows[0];
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
 * Process direct pick columns from a row (pick1, pick2, etc.)
 */
function processDirectPickColumns(
  row: LeagueGameDataRow | undefined,
  picks: { [key: string]: { championId: string; championName?: string; role?: string; playerName?: string } },
  teamPrefix: 'blue' | 'red',
  positions: string[]
) {
  if (!row) return;
  
  // Process direct pick columns (pick1, pick2, pick3, pick4, pick5)
  for (let i = 1; i <= 5; i++) {
    const pickKey = `pick${i}`;
    const champName = row[pickKey];
    
    if (champName && typeof champName === 'string' && champName.trim() !== '') {
      const role = positions[i-1] || `Position${i}`;
      const fullPickKey = `${teamPrefix}_${role.toLowerCase()}`;
      
      // Only add if this pick hasn't been added yet
      if (!picks[fullPickKey]) {
        picks[fullPickKey] = {
          championId: champName.trim(),
          championName: champName.trim(),
          role: role
        };
        
        console.log(`Extracted direct pick: ${fullPickKey} = ${champName}`);
      }
    }
  }
}

/**
 * Process direct ban columns from a row (ban1, ban2, etc.)
 */
function processDirectBanColumns(
  row: LeagueGameDataRow | undefined,
  bans: { [key: string]: { championId: string; championName?: string } },
  teamPrefix: 'blue' | 'red'
) {
  if (!row) return;
  
  // Process ban1, ban2, ban3, ban4, ban5 columns
  for (let i = 1; i <= 5; i++) {
    const banKey = `ban${i}`;
    const champName = row[banKey];
    
    if (champName && typeof champName === 'string' && champName.trim() !== '') {
      const fullBanKey = `${teamPrefix}_ban${i}`;
      
      bans[fullBanKey] = {
        championId: champName.trim(),
        championName: champName.trim()
      };
      
      console.log(`Extracted direct ban: ${fullBanKey} = ${champName}`);
    }
  }
}

/**
 * Process picks from dynamic properties in the row
 * This handles the case where pick data might be in different column formats
 */
function processTeamDynamicPicks(
  teamRows: LeagueGameDataRow[],
  picks: { [key: string]: { championId: string; championName?: string; role?: string; playerName?: string } },
  teamPrefix: 'blue' | 'red'
) {
  // Positions standard
  const positions = ['Top', 'Jungle', 'Mid', 'ADC', 'Support'];
  
  // Utiliser la première ligne qui contient des données de picks
  const pickRow = teamRows.find(row => {
    // Check for possible pick data in any column
    return Object.keys(row).some(key => 
      key.startsWith('pick') && 
      typeof row[key as keyof LeagueGameDataRow] === 'string' &&
      row[key as keyof LeagueGameDataRow] !== ''
    );
  });
  
  if (!pickRow) return;
  
  // Extraire les picks en cherchant dynamiquement les colonnes
  const pickKeys = Object.keys(pickRow).filter(key => 
    key.startsWith('pick') && 
    /pick\d+/.test(key) && 
    typeof pickRow[key as keyof LeagueGameDataRow] === 'string'
  );
  
  pickKeys.sort(); // Sort to ensure we go in order (pick1, pick2, etc.)
  
  pickKeys.forEach((key, index) => {
    if (index >= 5) return; // Only process the first 5 picks
    
    const champName = pickRow[key as keyof LeagueGameDataRow] as string;
    if (!champName) return;
    
    const role = positions[index] || `Position${index+1}`;
    const fullPickKey = `${teamPrefix}_${role.toLowerCase()}`;
    
    // N'ajouter que si ce pick n'a pas déjà été ajouté
    if (!picks[fullPickKey] && champName.trim() !== '') {
      picks[fullPickKey] = {
        championId: champName,
        championName: champName,
        role: role
      };
    }
  });
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
    return Object.keys(row).some(key => 
      key.startsWith('ban') && 
      /ban\d+/.test(key) && 
      typeof row[key as keyof LeagueGameDataRow] === 'string' && 
      row[key as keyof LeagueGameDataRow] !== ''
    );
  });
  
  if (!banRow) return;
  
  // Find all ban columns dynamically
  const banKeys = Object.keys(banRow).filter(key => 
    key.startsWith('ban') && 
    /ban\d+/.test(key) && 
    typeof banRow[key as keyof LeagueGameDataRow] === 'string'
  );
  
  banKeys.sort(); // Sort to ensure we go in order (ban1, ban2, etc.)
  
  banKeys.forEach((key, index) => {
    if (index >= 5) return; // Only process the first 5 bans
    
    const champName = banRow[key as keyof LeagueGameDataRow] as string;
    if (!champName || champName.trim() === '') return;
    
    // Créer une clé unique pour ce ban
    const fullBanKey = `${teamPrefix}_ban${index+1}`;
    
    bans[fullBanKey] = {
      championId: champName,
      championName: champName
    };
  });
}
