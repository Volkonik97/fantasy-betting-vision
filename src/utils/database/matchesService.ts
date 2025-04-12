
// Fichier de service central pour les matchs

// Exporter les fonctions depuis les différents fichiers de service
export { getMatches, clearMatchCache } from './matches/getMatches';
export { getMatchesByTeamId } from './matches/getMatchesByTeamId';
export { getMatchById } from './matches/getMatchById';

// Exporter les fonctions de statistiques de joueur
export { 
  getPlayerMatchStats,
  getPlayerStats,
  getPlayerTimelineStats,
  clearPlayerStatsCache,
  getPlayerMatchStatsByPlayerAndMatch
} from './matches/playerStats';

// Exporter les fonctions liées aux séries
export {
  isSeriesMatch,
  getSeriesScore,
  getGameNumberFromId,
  getBaseMatchId,
  getSeriesScoreUpToGame,
  isStandardSeries,
  isStandardSeriesLength,
  determineSeriesLength,
  fetchSeriesMatches,
  calculateSeriesScore
} from './matches/series';

// Exporter les fonctions de gestion des statistiques d'équipe
export { saveTeamMatchStats } from './matches/saveTeamStats';
export { getTeamMatchStats, getAllTeamMatchStats, getMatchTeamStats } from './matches/getTeamStats';
export { extractTeamSpecificStats } from './matches/teamStatsExtractor';

// Exporter d'autres fonctions
export { saveMatches } from './matches/saveMatches';
export { savePlayerMatchStats } from './matches/savePlayerMatchStats';
