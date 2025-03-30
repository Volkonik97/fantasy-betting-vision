
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
      // Log dragon data for debugging
      if (match.id === 'LOLTMNT02_215152' || match.id === 'LOLTMNT02_222859') {
        console.log(`Dragon data for match ${match.id}:`, { 
          dragons: match.dragons,
          oppDragons: match.oppDragons,
          infernals: match.infernals,
          mountains: match.mountains, 
          clouds: match.clouds,
          oceans: match.oceans,
          chemtechs: match.chemtechs,
          hextechs: match.hextechs,
          oppInfernals: match.oppInfernals,
          oppMountains: match.oppMountains,
          oppClouds: match.oppClouds,
          oppOceans: match.oppOceans,
          oppChemtechs: match.oppChemtechs,
          oppHextechs: match.oppHextechs
        });
      }

      // Parse specific drake types with safe conversion
      const parseIntSafe = (value: string | undefined): number => {
        if (!value) return 0;
        const parsed = parseInt(value);
        return isNaN(parsed) ? 0 : parsed;
      };

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
        
        // Drakes - Pour l'équipe bleue
        dragons: parseIntSafe(match.dragons),
        infernals: parseIntSafe(match.infernals),
        mountains: parseIntSafe(match.mountains), 
        clouds: parseIntSafe(match.clouds),
        oceans: parseIntSafe(match.oceans),
        chemtechs: parseIntSafe(match.chemtechs),
        hextechs: parseIntSafe(match.hextechs),
        drakes_unknown: parseIntSafe(match.drakesUnknown),
        elemental_drakes: parseIntSafe(match.elementalDrakes),
        
        // Drakes - Pour l'équipe rouge (opp_)
        opp_dragons: parseIntSafe(match.oppDragons),
        opp_elemental_drakes: parseIntSafe(match.oppElementalDrakes),
        opp_infernals: parseIntSafe(match.oppInfernals),
        opp_mountains: parseIntSafe(match.oppMountains),
        opp_clouds: parseIntSafe(match.oppClouds),
        opp_oceans: parseIntSafe(match.oppOceans),
        opp_chemtechs: parseIntSafe(match.oppChemtechs),
        opp_hextechs: parseIntSafe(match.oppHextechs),
        opp_drakes_unknown: parseIntSafe(match.oppDrakesUnknown),
        
        // Autres objectifs
        barons: parseIntSafe(match.barons),
        towers: parseIntSafe(match.towers),
        heralds: parseIntSafe(match.heralds),
        team_kills: parseIntSafe(match.teamKills),
        team_deaths: parseIntSafe(match.teamDeaths),
        elders: parseIntSafe(match.elders),
        opp_elders: parseIntSafe(match.oppElders),
        opp_heralds: parseIntSafe(match.oppHeralds),
        opp_barons: parseIntSafe(match.oppBarons),
        void_grubs: parseIntSafe(match.voidGrubs),
        opp_void_grubs: parseIntSafe(match.oppVoidGrubs),
        first_mid_tower: match.firstMidTower,
        first_three_towers: match.firstThreeTowers,
        opp_towers: parseIntSafe(match.oppTowers),
        turret_plates: parseIntSafe(match.turretPlates),
        opp_turret_plates: parseIntSafe(match.oppTurretPlates),
        inhibitors: parseIntSafe(match.inhibitors),
        opp_inhibitors: parseIntSafe(match.oppInhibitors),
        
        // Ensures picks and bans are included
        picks: match.picks,
        bans: match.bans
      };

      // Validation and logging for important matches
      if (match.id === 'LOLTMNT02_215152' || match.id === 'LOLTMNT02_222859') {
        const drakeSum = matchObject.extraStats.infernals + 
                         matchObject.extraStats.mountains + 
                         matchObject.extraStats.clouds + 
                         matchObject.extraStats.oceans + 
                         matchObject.extraStats.chemtechs + 
                         matchObject.extraStats.hextechs;
                         
        const oppDrakeSum = matchObject.extraStats.opp_infernals + 
                           matchObject.extraStats.opp_mountains + 
                           matchObject.extraStats.opp_clouds + 
                           matchObject.extraStats.opp_oceans + 
                           matchObject.extraStats.opp_chemtechs + 
                           matchObject.extraStats.opp_hextechs;
                           
        console.log(`Match ${match.id} - Données dragons après conversion:`, {
          blueTeam: {
            totalDragons: matchObject.extraStats.dragons,
            drakeSum: drakeSum,
            detailDragons: {
              infernals: matchObject.extraStats.infernals,
              mountains: matchObject.extraStats.mountains,
              clouds: matchObject.extraStats.clouds,
              oceans: matchObject.extraStats.oceans,
              chemtechs: matchObject.extraStats.chemtechs,
              hextechs: matchObject.extraStats.hextechs,
              unknown: matchObject.extraStats.drakes_unknown
            }
          },
          redTeam: {
            totalDragons: matchObject.extraStats.opp_dragons,
            drakeSum: oppDrakeSum,
            detailDragons: {
              infernals: matchObject.extraStats.opp_infernals,
              mountains: matchObject.extraStats.opp_mountains,
              clouds: matchObject.extraStats.opp_clouds,
              oceans: matchObject.extraStats.opp_oceans,
              chemtechs: matchObject.extraStats.opp_chemtechs,
              hextechs: matchObject.extraStats.opp_hextechs,
              unknown: matchObject.extraStats.opp_drakes_unknown
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
