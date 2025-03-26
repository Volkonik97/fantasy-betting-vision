
import { TeamCSV, PlayerCSV, MatchCSV, LeagueGameDataRow } from './csvTypes';
import { Team, Player, Match } from './mockData';

// Convert CSV data to application objects
export const convertTeamData = (teamsCSV: TeamCSV[]): Team[] => {
  return teamsCSV.map(team => ({
    id: team.id,
    name: team.name,
    logo: team.logo,
    region: team.region,
    winRate: parseFloat(team.winRate) || 0,
    blueWinRate: parseFloat(team.blueWinRate) || 0,
    redWinRate: parseFloat(team.redWinRate) || 0,
    averageGameTime: parseFloat(team.averageGameTime) || 0,
    players: []
  }));
};

export const convertPlayerData = (playersCSV: PlayerCSV[]): Player[] => {
  return playersCSV.map(player => ({
    id: player.id,
    name: player.name,
    role: player.role as 'Top' | 'Jungle' | 'Mid' | 'ADC' | 'Support',
    image: player.image,
    team: player.team,
    kda: parseFloat(player.kda) || 0,
    csPerMin: parseFloat(player.csPerMin) || 0,
    damageShare: parseFloat(player.damageShare) || 0,
    championPool: player.championPool ? player.championPool.split(',').map(champ => champ.trim()) : []
  }));
};

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

    if (match.status === 'Completed' && match.winnerTeamId) {
      matchObject.result = {
        winner: match.winnerTeamId,
        score: [parseInt(match.scoreBlue || '0'), parseInt(match.scoreRed || '0')],
        duration: match.duration,
        mvp: match.mvp,
        firstBlood: match.firstBlood,
        firstDragon: match.firstDragon,
        firstBaron: match.firstBaron
      };
    }

    return matchObject;
  });
};

// Function to divide an array into chunks
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}
