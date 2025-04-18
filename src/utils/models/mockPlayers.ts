
import { Player } from './types';
import { teams } from './mockTeams';

export const players: Player[] = [
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
    killParticipation: 0.68,
    kill_participation_pct: 68, // Added kill_participation_pct
    championPool: 'Gnar, Jax, Jayce' 
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
    killParticipation: 0.72,
    kill_participation_pct: 72, // Added kill_participation_pct
    championPool: 'Viego, Lee Sin, Vi'
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
    killParticipation: 0.65,
    kill_participation_pct: 65, // Added kill_participation_pct
    championPool: 'Azir, Ahri, Ryze'
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
    killParticipation: 0.78,
    kill_participation_pct: 78, // Added kill_participation_pct
    championPool: 'Jinx, Aphelios, Kai\'Sa'
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
    killParticipation: 0.85,
    kill_participation_pct: 85, // Added kill_participation_pct
    championPool: 'Thresh, Nautilus, Lulu'
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
    killParticipation: 0.62,
    kill_participation_pct: 62, // Added kill_participation_pct
    championPool: 'Gnar, Gragas, Renekton'
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
    killParticipation: 0.76,
    kill_participation_pct: 76, // Added kill_participation_pct
    championPool: 'Wukong, Trundle, Vi'
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
    killParticipation: 0.68,
    kill_participation_pct: 68, // Added kill_participation_pct
    championPool: 'Azir, Sylas, Akali'
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
    killParticipation: 0.82,
    kill_participation_pct: 82, // Added kill_participation_pct
    championPool: 'Zeri, Lucian, Aphelios'
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
    killParticipation: 0.88,
    kill_participation_pct: 88, // Added kill_participation_pct
    championPool: 'Tahm Kench, Nami, Rakan'
  }
];

// Populate team players
export const populateTeamPlayers = () => {
  teams.forEach(team => {
    team.players = players.filter(player => player.team === team.id);
  });
  
  return teams;
};
