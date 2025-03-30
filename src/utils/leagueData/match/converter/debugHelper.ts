
import { MatchCSV } from '../../../csv/types';

/**
 * Debug helper function for specific match IDs
 */
export function debugMatchData(gameId: string, matchCsv: MatchCSV): void {
  // Debug for specific problematic matches
  if (gameId === 'LOLTMNT02_215152' || gameId === 'LOLTMNT02_222859') {
    console.log(`Match ${gameId} - Dragon data in final MatchCSV:`, {
      clouds: matchCsv.clouds,
      oppClouds: matchCsv.oppClouds,
      oceans: matchCsv.oceans,
      oppOceans: matchCsv.oppOceans,
      hextechs: matchCsv.hextechs,
      oppHextechs: matchCsv.oppHextechs
    });
    
    // Validate total dragons vs specific dragons
    const blueSum = parseInt(matchCsv.infernals || '0') +
                  parseInt(matchCsv.mountains || '0') +
                  parseInt(matchCsv.clouds || '0') +
                  parseInt(matchCsv.oceans || '0') +
                  parseInt(matchCsv.chemtechs || '0') +
                  parseInt(matchCsv.hextechs || '0');
                  
    console.log(`Match ${gameId} - Validation sums:`, {
      totalDragons: parseInt(matchCsv.dragons || '0'),
      calculatedSum: blueSum,
      detailDragons: {
        infernals: parseInt(matchCsv.infernals || '0'),
        mountains: parseInt(matchCsv.mountains || '0'),
        clouds: parseInt(matchCsv.clouds || '0'),
        oceans: parseInt(matchCsv.oceans || '0'),
        chemtechs: parseInt(matchCsv.chemtechs || '0'),
        hextechs: parseInt(matchCsv.hextechs || '0')
      }
    });
  }
}
