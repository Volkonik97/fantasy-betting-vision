
import { Match } from './types';
import { populateTeamPlayers } from './mockPlayers';

// Get populated teams with players
const teams = populateTeamPlayers();

export const matches: Match[] = [
  {
    id: 'm1',
    tournament: 'Worlds 2023',
    date: '2023-10-30T14:00:00Z',
    teamBlue: teams[0], // T1
    teamRed: teams[1], // Gen.G
    predictedWinner: teams[0].id,
    blueWinOdds: 0.58,
    redWinOdds: 0.42,
    status: 'Upcoming'
  },
  {
    id: 'm2',
    tournament: 'Worlds 2023',
    date: '2023-10-31T16:00:00Z',
    teamBlue: teams[2], // JDG
    teamRed: teams[3], // Fnatic
    predictedWinner: teams[2].id,
    blueWinOdds: 0.67,
    redWinOdds: 0.33,
    status: 'Upcoming'
  },
  {
    id: 'm3',
    tournament: 'Worlds 2023',
    date: '2023-10-28T12:00:00Z',
    teamBlue: teams[4], // Cloud9
    teamRed: teams[0], // T1
    predictedWinner: teams[0].id,
    blueWinOdds: 0.28,
    redWinOdds: 0.72,
    status: 'Completed',
    result: {
      winner: teams[0].id,
      score: [0, 3],
      duration: '28:42',
      mvp: 'Faker',
      firstBlood: teams[0].id,
      firstDragon: teams[0].id,
      firstBaron: teams[0].id
    }
  },
  {
    id: 'm4',
    tournament: 'Worlds 2023',
    date: '2023-10-29T15:00:00Z',
    teamBlue: teams[1], // Gen.G
    teamRed: teams[2], // JDG
    predictedWinner: teams[1].id,
    blueWinOdds: 0.55,
    redWinOdds: 0.45,
    status: 'Completed',
    result: {
      winner: teams[1].id,
      score: [3, 2],
      duration: '32:18',
      mvp: 'Chovy',
      firstBlood: teams[2].id,
      firstDragon: teams[1].id,
      firstBaron: teams[1].id
    }
  },
  {
    id: 'm5',
    tournament: 'LCK 2023 Summer',
    date: '2023-07-15T12:00:00Z',
    teamBlue: teams[0], // T1
    teamRed: teams[1], // Gen.G
    predictedWinner: teams[1].id,
    blueWinOdds: 0.48,
    redWinOdds: 0.52,
    status: 'Completed',
    result: {
      winner: teams[1].id,
      score: [1, 2],
      duration: '29:54',
      mvp: 'Peanut',
      firstBlood: teams[0].id,
      firstDragon: teams[1].id,
      firstBaron: teams[1].id
    }
  },
  {
    id: 'm6',
    tournament: 'Worlds 2023',
    date: new Date().toISOString(), // Today's date for a live match
    teamBlue: teams[3], // Fnatic
    teamRed: teams[4], // Cloud9
    predictedWinner: teams[3].id,
    blueWinOdds: 0.62,
    redWinOdds: 0.38,
    status: 'Live'
  }
];
