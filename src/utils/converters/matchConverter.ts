
import { MatchCSV } from '../csv/types';
import { Match, Team } from '../models/types';
import { prepareJsonData } from '../leagueData/types';

/**
 * Convert match CSV data to application Match objects
 */
export const convertMatchData = (matchesCSV: MatchCSV[], teams: Team[]): Match[] => {
  // Group matches by ID to handle blue and red teams together
  const matchesById = new Map<string, MatchCSV[]>();
  
  matchesCSV.forEach(match => {
    const currentMatches = matchesById.get(match.id) || [];
    currentMatches.push(match);
    matchesById.set(match.id, currentMatches);
  });

  return Array.from(matchesById.entries()).map(([matchId, matchRows]) => {
    // Log warning if we don't have exactly two rows per match
    if (matchRows.length !== 2) {
      console.warn(`Match ${matchId} has ${matchRows.length} team entries instead of 2`);
    }
    
    // Sort rows by side/position - blue should come first, red second
    matchRows.sort((a, b) => {
      // If we have a teamPosition column, use it
      if (a.teamPosition && b.teamPosition) {
        return a.teamPosition === "Blue" ? -1 : 1;
      }
      
      // Otherwise assume the first row is blue, second is red
      // This is a fallback mechanism and might not be accurate in all cases
      return 0;
    });
    
    const blueTeamRow = matchRows[0]; // First row = blue team
    const redTeamRow = matchRows.length > 1 ? matchRows[1] : null; // Second row = red team, if available
    
    const teamBlue = teams.find(t => t.id === blueTeamRow.teamBlueId) || teams[0];
    const teamRed = teams.find(t => t.id === blueTeamRow.teamRedId) || teams[1];
    
    const matchObject: Match = {
      id: blueTeamRow.id,
      tournament: blueTeamRow.tournament,
      date: blueTeamRow.date,
      teamBlue,
      teamRed,
      predictedWinner: blueTeamRow.predictedWinner,
      blueWinOdds: parseFloat(blueTeamRow.blueWinOdds) || 0.5,
      redWinOdds: parseFloat(blueTeamRow.redWinOdds) || 0.5,
      status: blueTeamRow.status as 'Upcoming' | 'Live' | 'Completed'
    };

    // Create extraStats object with data for both teams
    if (blueTeamRow.teamStats) {
      // Process picks and bans data first to properly log everything
      const processedPicks = prepareJsonData(blueTeamRow.picks);
      const processedBans = prepareJsonData(blueTeamRow.bans);
      
      console.log(`[CSV Converter] Match ${blueTeamRow.id} - Picks and bans:`, {
        rawPicks: blueTeamRow.picks ? (typeof blueTeamRow.picks === 'object' ? 
          Object.keys(blueTeamRow.picks).length + ' picks' : typeof blueTeamRow.picks) : 'undefined',
        rawBans: blueTeamRow.bans ? (typeof blueTeamRow.bans === 'object' ? 
          Object.keys(blueTeamRow.bans).length + ' bans' : typeof blueTeamRow.bans) : 'undefined',
        processedPicks: processedPicks ? (typeof processedPicks === 'object' ? 
          Object.keys(processedPicks).length + ' picks' : typeof processedPicks) : 'undefined',
        processedBans: processedBans ? (typeof processedBans === 'object' ? 
          Object.keys(processedBans).length + ' bans' : typeof processedBans) : 'undefined'
      });
      
      // Log dragon data for debugging specific matches
      if (blueTeamRow.id === 'LOLTMNT02_215152' || blueTeamRow.id === 'LOLTMNT02_222859') {
        console.log(`[CSV Converter] Dragon data for match ${blueTeamRow.id}:`, { 
          // Dragons data directly from CSV
          dragons: blueTeamRow.dragons,
          infernals: blueTeamRow.infernals,
          mountains: blueTeamRow.mountains, 
          clouds: blueTeamRow.clouds,
          oceans: blueTeamRow.oceans,
          chemtechs: blueTeamRow.chemtechs,
          hextechs: blueTeamRow.hextechs
        });
      }

      // Directly use the numeric values from the CSV data
      matchObject.extraStats = {
        patch: blueTeamRow.patch || '',
        year: blueTeamRow.year || '',
        split: blueTeamRow.split || '',
        playoffs: blueTeamRow.playoffs === 'true',
        team_kpm: parseFloat(blueTeamRow.teamKpm || '0'),
        ckpm: parseFloat(blueTeamRow.ckpm || '0'),
        
        // First objectives - can be either string or boolean
        first_blood: blueTeamRow.firstBlood,
        first_dragon: blueTeamRow.firstDragon,
        first_herald: blueTeamRow.firstHerald,
        first_baron: blueTeamRow.firstBaron,
        first_tower: blueTeamRow.firstTower,
        first_mid_tower: blueTeamRow.firstMidTower,
        first_three_towers: blueTeamRow.firstThreeTowers,
        
        // Drakes - valeurs directes
        dragons: parseInt(blueTeamRow.dragons || '0'),
        infernals: parseInt(blueTeamRow.infernals || '0'),
        mountains: parseInt(blueTeamRow.mountains || '0'), 
        clouds: parseInt(blueTeamRow.clouds || '0'),
        oceans: parseInt(blueTeamRow.oceans || '0'),
        chemtechs: parseInt(blueTeamRow.chemtechs || '0'),
        hextechs: parseInt(blueTeamRow.hextechs || '0'),
        drakes_unknown: parseInt(blueTeamRow.drakesUnknown || '0'), // Fixed property name here
        elemental_drakes: parseInt(blueTeamRow.elementalDrakes || '0'),
        
        // Autres objectifs
        barons: parseInt(blueTeamRow.barons || '0'),
        towers: parseInt(blueTeamRow.towers || '0'),
        heralds: parseInt(blueTeamRow.heralds || '0'),
        team_kills: parseInt(blueTeamRow.teamKills || '0'),
        team_deaths: parseInt(blueTeamRow.teamDeaths || '0'),
        elders: parseInt(blueTeamRow.elders || '0'),
        void_grubs: parseInt(blueTeamRow.voidGrubs || '0'),
        turret_plates: parseInt(blueTeamRow.turretPlates || '0'),
        inhibitors: parseInt(blueTeamRow.inhibitors || '0'),
        
        // Ensures picks and bans are included
        picks: processedPicks,
        bans: processedBans
      };

      // Validation and logging for important matches
      if (blueTeamRow.id === 'LOLTMNT02_215152' || blueTeamRow.id === 'LOLTMNT02_222859') {
        const blueSum = parseInt(blueTeamRow.infernals || '0') + 
                       parseInt(blueTeamRow.mountains || '0') + 
                       parseInt(blueTeamRow.clouds || '0') + 
                       parseInt(blueTeamRow.oceans || '0') + 
                       parseInt(blueTeamRow.chemtechs || '0') + 
                       parseInt(blueTeamRow.hextechs || '0');
                       
        console.log(`[CSV Converter] Match ${blueTeamRow.id} - Sums compared:`, {
          blueTeam: {
            totalDragons: parseInt(blueTeamRow.dragons || '0'),
            calculatedSum: blueSum,
            detailDragons: {
              infernals: parseInt(blueTeamRow.infernals || '0'),
              mountains: parseInt(blueTeamRow.mountains || '0'),
              clouds: parseInt(blueTeamRow.clouds || '0'),
              oceans: parseInt(blueTeamRow.oceans || '0'),
              chemtechs: parseInt(blueTeamRow.chemtechs || '0'),
              hextechs: parseInt(blueTeamRow.hextechs || '0')
            }
          }
        });
      }
    }

    if (blueTeamRow.status === 'Completed' && blueTeamRow.winnerTeamId) {
      matchObject.result = {
        winner: blueTeamRow.winnerTeamId,
        score: [parseInt(blueTeamRow.scoreBlue || '0'), parseInt(blueTeamRow.scoreRed || '0')],
        duration: blueTeamRow.duration,
        mvp: blueTeamRow.mvp,
        firstBlood: blueTeamRow.firstBlood,
        firstDragon: blueTeamRow.firstDragon,
        firstBaron: blueTeamRow.firstBaron,
        firstHerald: blueTeamRow.firstHerald,
        firstTower: blueTeamRow.firstTower
      };
    }

    return matchObject;
  });
};
