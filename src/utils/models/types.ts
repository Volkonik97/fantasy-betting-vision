export type PlayerRole = "Top" | "Jungle" | "Mid" | "ADC" | "Support" | "Unknown";

export interface Player {
  id: string;
  name: string;
  role: "Top" | "Jungle" | "Mid" | "ADC" | "Support" | "Unknown";
  team: string;
  kda: number;
  csPerMin: number;
  killParticipation: number;
  championPool: string;
  image: string;
  vspm?: number;
  wcpm?: number;
  goldSharePercent?: number;
}

export interface Team {
  id: string;
  name: string;
  slug: string;
  logo: string;
  region: string;
}

export interface Match {
  gameId: string;
  platformGameId: string;
  gameCreation: number;
  gameDuration: number;
  gameVersion: string;
  queueId: number;
  mapId: number;
  seasonId: number;
  teams: Team[];
  players: Player[];
}
