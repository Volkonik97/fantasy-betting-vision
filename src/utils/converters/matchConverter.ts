
import { MatchCSV } from '../csv/types';
import { Match, Team } from '../models/types';

/**
 * Convert match CSV data to application Match objects
 */
export const convertMatchData = (matchesCSV: MatchCSV[], teams: Team[]): Match[] => {
  return matchesCSV.map(match => {
    const teamBlue = teams.find(t => t.id === match.teamBlueId) || teams[0];
    const teamRed = teams.find(t => t.id === match.teamRedId) || teams[1];
    
    const matchObject: Match = {
      id: match.id,
      tournament: match.tournament,
      date: match.date,
      teamBlue,
      teamRed,
      predictedWinner: match.predictedWinner,
      blueWinOdds: parseFloat(match.blueWinOdds) || 0.5,
      redWinOdds: parseFloat(match.redWinOdds) || 0.5,
      status: match.status as 'Upcoming' | 'Live' | 'Completed'
    };

    // Add extraStats for objective data
    if (match.teamStats) {
      // Log dragon data for debugging specific matches
      if (match.id === 'LOLTMNT02_215152' || match.id === 'LOLTMNT02_222859') {
        console.log(`[CSV Converter] Dragon data for match ${match.id}:`, { 
          // Blue team dragon data
          dragons: match.dragons,
          infernals: match.infernals,
          mountains: match.mountains, 
          clouds: match.clouds,
          oceans: match.oceans,
          chemtechs: match.chemtechs,
          hextechs: match.hextechs
        });
      }

      // Directly use the numeric values from the CSV data
      matchObject.extraStats = {
        patch: match.patch || '',
        year: match.year || '',
        split: match.split || '',
        playoffs: match.playoffs === 'true',
        team_kpm: parseFloat(match.teamKpm || '0'),
        ckpm: parseFloat(match.ckpm || '0'),
        first_blood: match.firstBlood,
        first_dragon: match.firstDragon,
        first_herald: match.firstHerald,
        first_baron: match.firstBaron,
        first_tower: match.firstTower,
        
        // Drakes - Pour l'équipe bleue (valeurs directes)
        dragons: parseInt(match.dragons || '0'),
        infernals: parseInt(match.infernals || '0'),
        mountains: parseInt(match.mountains || '0'), 
        clouds: parseInt(match.clouds || '0'),
        oceans: parseInt(match.oceans || '0'),
        chemtechs: parseInt(match.chemtechs || '0'),
        hextechs: parseInt(match.hextechs || '0'),
        drakes_unknown: parseInt(match.drakesUnknown || '0'),
        elemental_drakes: parseInt(match.elementalDrakes || '0'),
        
        // Note: Nous ne stockons plus les données de l'équipe rouge avec le préfixe "opp_"
        // Ces données seront fournies séparément lors du traitement des données
        
        // Autres objectifs
        barons: parseInt(match.barons || '0'),
        towers: parseInt(match.towers || '0'),
        heralds: parseInt(match.heralds || '0'),
        team_kills: parseInt(match.teamKills || '0'),
        team_deaths: parseInt(match.teamDeaths || '0'),
        elders: parseInt(match.elders || '0'),
        void_grubs: parseInt(match.voidGrubs || '0'),
        first_mid_tower: match.firstMidTower,
        first_three_towers: match.firstThreeTowers,
        turret_plates: parseInt(match.turretPlates || '0'),
        inhibitors: parseInt(match.inhibitors || '0'),
        
        // Ensures picks and bans are included
        picks: match.picks,
        bans: match.bans
      };

      // Validation and logging for important matches
      if (match.id === 'LOLTMNT02_215152' || match.id === 'LOLTMNT02_222859') {
        const blueSum = parseInt(match.infernals || '0') + 
                       parseInt(match.mountains || '0') + 
                       parseInt(match.clouds || '0') + 
                       parseInt(match.oceans || '0') + 
                       parseInt(match.chemtechs || '0') + 
                       parseInt(match.hextechs || '0');
                       
        console.log(`[CSV Converter] Match ${match.id} - Sums compared:`, {
          blueTeam: {
            totalDragons: parseInt(match.dragons || '0'),
            calculatedSum: blueSum,
            detailDragons: {
              infernals: parseInt(match.infernals || '0'),
              mountains: parseInt(match.mountains || '0'),
              clouds: parseInt(match.clouds || '0'),
              oceans: parseInt(match.oceans || '0'),
              chemtechs: parseInt(match.chemtechs || '0'),
              hextechs: parseInt(match.hextechs || '0')
            }
          }
        });
      }
    }

    if (match.status === 'Completed' && match.winnerTeamId) {
      matchObject.result = {
        winner: match.winnerTeamId,
        score: [parseInt(match.scoreBlue || '0'), parseInt(match.scoreRed || '0')],
        duration: match.duration,
        mvp: match.mvp,
        firstBlood: match.firstBlood,
        firstDragon: match.firstDragon,
        firstBaron: match.firstBaron,
        firstHerald: match.firstHerald,
        firstTower: match.firstTower
      };
    }

    return matchObject;
  });
};
