
import { Team } from './types';

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
    players: [] // Will be populated after player import
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
    players: [] // Will be populated after player import
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
    players: [] // Will be populated after player import
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
    players: [] // Will be populated after player import
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
    players: [] // Will be populated after player import
  }
];
