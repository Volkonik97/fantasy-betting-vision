
import { TeamStatsTracker, TeamStatsMap } from "./types";

/**
 * Create a new team stats tracker
 */
export const createTeamTracker = (id: string, name: string, region: string = ""): TeamStatsTracker => {
  return {
    id,
    name,
    region,
    logo: "",
    players: [],
    games: 0,
    wins: 0,
    losses: 0,
    blueGames: 0,
    blueWins: 0,
    blueLosses: 0,
    redGames: 0,
    redWins: 0,
    redLosses: 0,
    kills: 0,
    deaths: 0,
    dragons: 0,
    heralds: 0,
    barons: 0,
    towers: 0,
    totalGameTime: 0,
    gameTimes: []
  };
};

/**
 * Merge team records, needed when team has different IDs in different data sources
 */
export const mergeTeams = (teamsMap: TeamStatsMap, sourceId: string, targetId: string): void => {
  const sourceTeam = teamsMap.get(sourceId);
  const targetTeam = teamsMap.get(targetId);
  
  if (!sourceTeam || !targetTeam) {
    console.error(`Cannot merge teams - source: ${sourceId}, target: ${targetId}`, {
      sourceExists: !!sourceTeam,
      targetExists: !!targetTeam
    });
    return;
  }
  
  // Transfer stats from source to target
  targetTeam.games += sourceTeam.games;
  targetTeam.wins += sourceTeam.wins;
  targetTeam.losses += sourceTeam.losses;
  targetTeam.blueGames += sourceTeam.blueGames;
  targetTeam.blueWins += sourceTeam.blueWins;
  targetTeam.blueLosses += sourceTeam.blueLosses;
  targetTeam.redGames += sourceTeam.redGames;
  targetTeam.redWins += sourceTeam.redWins;
  targetTeam.redLosses += sourceTeam.redLosses;
  targetTeam.kills += sourceTeam.kills;
  targetTeam.deaths += sourceTeam.deaths;
  targetTeam.dragons += sourceTeam.dragons;
  targetTeam.heralds += sourceTeam.heralds;
  targetTeam.barons += sourceTeam.barons;
  targetTeam.towers += sourceTeam.towers;
  targetTeam.totalGameTime += sourceTeam.totalGameTime;
  targetTeam.gameTimes = [...targetTeam.gameTimes, ...sourceTeam.gameTimes];
  
  // Remove the source team from the map
  teamsMap.delete(sourceId);
};
