export interface LeagueGameDataRow {
  [key: string]: string;
  gameid?: string;
  datacompleteness?: string;
  url?: string;
  league?: string;
  year?: string;
  split?: string;
  playoffs?: string;
  date?: string;
  game?: string;
  patch?: string;
  participantid?: string;
  side?: string;
  position?: string;
  teamposition?: string; // Added field for team position (Blue/Red)
  playername?: string;
  teamname?: string;
  teamid?: string;
  champion?: string;
  // Direct ban columns
  ban1?: string;
  ban2?: string;
  ban3?: string;
  ban4?: string;
  ban5?: string;
  // Direct pick columns
  pick1?: string;
  pick2?: string;
  pick3?: string;
  pick4?: string;
  pick5?: string;
  gamelength?: string;
  result?: string;
  kills?: string;
  deaths?: string;
  assists?: string;
  teamkills?: string;
  teamdeaths?: string;
  doublekills?: string;
  triplekills?: string;
  quadrakills?: string;
  pentakills?: string;
  firstblood?: string;
  firstbloodkill?: string;
  firstbloodassist?: string;
  firstbloodvictim?: string;
  team_kpm?: string;
  ckpm?: string;
  firstdragon?: string;
  dragons?: string;
  opp_dragons?: string;
  elementaldrakes?: string;
  opp_elementaldrakes?: string;
  infernals?: string;
  mountains?: string;
  clouds?: string;
  oceans?: string;
  chemtechs?: string;
  hextechs?: string;
  dragons_type_unknown?: string;
  elders?: string;
  opp_elders?: string;
  firstherald?: string;
  heralds?: string;
  opp_heralds?: string;
  firstbaron?: string;
  barons?: string;
  opp_barons?: string;
  firsttower?: string;
  towers?: string;
  opp_towers?: string;
  firstmidtower?: string;
  firsttothreetowers?: string;
  turretplates?: string;
  opp_turretplates?: string;
  inhibitors?: string;
  opp_inhibitors?: string;
  damagetochampions?: string;
  dpm?: string;
  damageshare?: string;
  damagetakenperminute?: string;
  damagemitigatedperminute?: string;
  wardsplaced?: string;
  wpm?: string;
  wardskilled?: string;
  wcpm?: string;
  controlwardsbought?: string;
  visionscore?: string;
  vspm?: string;
  totalgold?: string;
  earnedgold?: string;
  earnedgpm?: string;
  earnedgoldshare?: string;
  goldspent?: string;
  gspd?: string;
  total_cs?: string;
  minionkills?: string;
  monsterkills?: string;
  monsterkillsownjungle?: string;
  monsterkillsenemyjungle?: string;
  cspm?: string;
  goldat10?: string;
  xpat10?: string;
  csat10?: string;
  opp_goldat10?: string;
  opp_xpat10?: string;
  opp_csat10?: string;
  golddiffat10?: string;
  xpdiffat10?: string;
  csdiffat10?: string;
  killsat10?: string;
  assistsat10?: string;
  deathsat10?: string;
  opp_killsat10?: string;
  opp_assistsat10?: string;
  opp_deathsat10?: string;
  goldat15?: string;
  xpat15?: string;
  csat15?: string;
  opp_goldat15?: string;
  opp_xpat15?: string;
  opp_csat15?: string;
  golddiffat15?: string;
  xpdiffat15?: string;
  csdiffat15?: string;
  killsat15?: string;
  assistsat15?: string;
  deathsat15?: string;
  opp_killsat15?: string;
  opp_assistsat15?: string;
  opp_deathsat15?: string;
}

/**
 * Prepares JSON data for database storage, ensuring it's in a proper format
 */
export function prepareJsonData(data: any): any {
  if (!data) return null;
  
  try {
    // If it's already a string, try to parse it
    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch {
        // If not valid JSON, return as is
        return data;
      }
    } 
    
    // If it's already an object, stringify and re-parse to ensure deep cloning
    // and to remove any circular references
    return JSON.parse(JSON.stringify(data));
  } catch (error) {
    console.error("Error preparing JSON data:", error);
    console.log("Original data type:", typeof data);
    
    if (typeof data === 'object') {
      console.log("Object keys:", Object.keys(data));
    }
    
    // Return null on error to avoid database issues
    return null;
  }
}
