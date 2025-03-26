
export interface Team {
  id: string;
  name: string;
  logo: string;
  region: string;
  winRate: number;
  blueWinRate: number;
  redWinRate: number;
  averageGameTime: number;
  players: Player[];
}

export interface Player {
  id: string;
  name: string;
  role: 'Top' | 'Jungle' | 'Mid' | 'ADC' | 'Support';
  image: string;
  team: string;
  kda: number;
  csPerMin: number;
  damageShare: number;
  championPool: string[];
}

export interface Match {
  id: string;
  tournament: string;
  date: string;
  teamBlue: Team;
  teamRed: Team;
  predictedWinner: string;
  blueWinOdds: number;
  redWinOdds: number;
  status: 'Upcoming' | 'Live' | 'Completed';
  result?: {
    winner: string;
    score: [number, number];
  };
}

export interface Tournament {
  id: string;
  name: string;
  region: string;
  startDate: string;
  endDate: string;
  logo: string;
}

export const teams: Team[] = [
  {
    id: 't1',
    name: 'T1',
    logo: 'https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/7/78/T1logo_profile.png',
    region: 'LCK',
    winRate: 0.82,
    blueWinRate: 0.85,
    redWinRate: 0.79,
    averageGameTime: 28.5,
    players: [] // Will be populated below
  },
  {
    id: 'geng',
    name: 'Gen.G',
    logo: 'https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/e/e3/Gen.Glogo_profile.png',
    region: 'LCK',
    winRate: 0.78,
    blueWinRate: 0.76,
    redWinRate: 0.80,
    averageGameTime: 29.2,
    players: [] // Will be populated below
  },
  {
    id: 'jdg',
    name: 'JD Gaming',
    logo: 'https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/d/d2/JD_Gaminglogo_profile.png',
    region: 'LPL',
    winRate: 0.75,
    blueWinRate: 0.78,
    redWinRate: 0.73,
    averageGameTime: 30.1,
    players: [] // Will be populated below
  },
  {
    id: 'fnc',
    name: 'Fnatic',
    logo: 'https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/f/fc/Fnaticlogo_profile.png',
    region: 'LEC',
    winRate: 0.68,
    blueWinRate: 0.71,
    redWinRate: 0.65,
    averageGameTime: 31.4,
    players: [] // Will be populated below
  },
  {
    id: 'c9',
    name: 'Cloud9',
    logo: 'https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/8/88/Cloud9logo_profile.png',
    region: 'LCS',
    winRate: 0.70,
    blueWinRate: 0.68,
    redWinRate: 0.72,
    averageGameTime: 30.8,
    players: [] // Will be populated below
  }
];

const players: Player[] = [
  // T1 Players
  {
    id: 'p1',
    name: 'Zeus',
    role: 'Top',
    image: 'https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/3/35/T1_Zeus_2023_Split_1.png',
    team: 't1',
    kda: 4.2,
    csPerMin: 8.7,
    damageShare: 0.24,
    championPool: ['Gnar', 'Jax', 'Jayce']
  },
  {
    id: 'p2',
    name: 'Oner',
    role: 'Jungle',
    image: 'https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/c/c6/T1_Oner_2023_Split_1.png',
    team: 't1',
    kda: 4.8,
    csPerMin: 6.2,
    damageShare: 0.18,
    championPool: ['Viego', 'Lee Sin', 'Vi']
  },
  {
    id: 'p3',
    name: 'Faker',
    role: 'Mid',
    image: 'https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/c/c8/T1_Faker_2023_Split_1.png',
    team: 't1',
    kda: 5.6,
    csPerMin: 9.1,
    damageShare: 0.28,
    championPool: ['Azir', 'Ahri', 'Ryze']
  },
  {
    id: 'p4',
    name: 'Gumayusi',
    role: 'ADC',
    image: 'https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/2/23/T1_Gumayusi_2023_Split_1.png',
    team: 't1',
    kda: 7.2,
    csPerMin: 10.3,
    damageShare: 0.30,
    championPool: ['Jinx', 'Aphelios', 'Kai\'Sa']
  },
  {
    id: 'p5',
    name: 'Keria',
    role: 'Support',
    image: 'https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/4/48/T1_Keria_2023_Split_1.png',
    team: 't1',
    kda: 6.8,
    csPerMin: 1.2,
    damageShare: 0.10,
    championPool: ['Thresh', 'Nautilus', 'Lulu']
  },
  
  // Gen.G Players
  {
    id: 'p6',
    name: 'Doran',
    role: 'Top',
    image: 'https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/e/e2/GENG_Doran_2023_Split_1.png',
    team: 'geng',
    kda: 3.8,
    csPerMin: 8.5,
    damageShare: 0.22,
    championPool: ['Gnar', 'Gragas', 'Renekton']
  },
  {
    id: 'p7',
    name: 'Peanut',
    role: 'Jungle',
    image: 'https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/4/4f/GENG_Peanut_2023_Split_1.png',
    team: 'geng',
    kda: 4.5,
    csPerMin: 6.0,
    damageShare: 0.16,
    championPool: ['Wukong', 'Trundle', 'Vi']
  },
  {
    id: 'p8',
    name: 'Chovy',
    role: 'Mid',
    image: 'https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/2/20/GENG_Chovy_2023_Split_1.png',
    team: 'geng',
    kda: 6.2,
    csPerMin: 9.8,
    damageShare: 0.29,
    championPool: ['Azir', 'Sylas', 'Akali']
  },
  {
    id: 'p9',
    name: 'Peyz',
    role: 'ADC',
    image: 'https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/c/ce/GENG_Peyz_2023_Split_1.png',
    team: 'geng',
    kda: 6.8,
    csPerMin: 10.1,
    damageShare: 0.31,
    championPool: ['Zeri', 'Lucian', 'Aphelios']
  },
  {
    id: 'p10',
    name: 'Delight',
    role: 'Support',
    image: 'https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/5/51/GENG_Delight_2023_Split_1.png',
    team: 'geng',
    kda: 5.6,
    csPerMin: 0.9,
    damageShare: 0.09,
    championPool: ['Tahm Kench', 'Nami', 'Rakan']
  }
];

// Populate team players
teams.forEach(team => {
  team.players = players.filter(player => player.team === team.id);
});

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
      score: [0, 3]
    }
  }
];

export const tournaments: Tournament[] = [
  {
    id: 'worlds2023',
    name: 'World Championship 2023',
    region: 'International',
    startDate: '2023-10-10',
    endDate: '2023-11-19',
    logo: 'https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/3/37/Worlds_2023_logo.png'
  },
  {
    id: 'lck2023summer',
    name: 'LCK 2023 Summer',
    region: 'Korea',
    startDate: '2023-06-07',
    endDate: '2023-08-20',
    logo: 'https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/d/dd/LCK_2021_logo.png'
  },
  {
    id: 'lpl2023summer',
    name: 'LPL 2023 Summer',
    region: 'China',
    startDate: '2023-06-05',
    endDate: '2023-08-18',
    logo: 'https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/7/7f/LPL_logo.png'
  }
];

export const getSideStatistics = (teamId: string) => {
  const team = teams.find(t => t.id === teamId);
  if (!team) return null;
  
  return {
    blueWins: Math.round(team.blueWinRate * 100),
    redWins: Math.round(team.redWinRate * 100),
    blueFirstBlood: 62,
    redFirstBlood: 58,
    blueFirstDragon: 71,
    redFirstDragon: 65,
    blueFirstHerald: 68,
    redFirstHerald: 59,
    blueFirstTower: 65,
    redFirstTower: 62
  };
};
