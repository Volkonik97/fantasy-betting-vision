
/**
 * Normalize role name to standard format
 * @param role The role name to normalize
 * @returns The normalized role name
 */
export const normalizeRoleName = (role: string): 'Top' | 'Jungle' | 'Mid' | 'ADC' | 'Support' => {
  if (!role) return 'Mid'; // Default role if none provided
  
  const lowerRole = role.toLowerCase().trim();
  
  if (lowerRole.includes('top')) return 'Top';
  if (lowerRole.includes('jung') || lowerRole === 'jng' || lowerRole === 'jgl') return 'Jungle';
  if (lowerRole.includes('mid')) return 'Mid';
  if (lowerRole.includes('adc') || lowerRole === 'bot' || lowerRole.includes('bottom')) return 'ADC';
  if (lowerRole.includes('sup') || lowerRole === 'supp') return 'Support';
  
  // If no match found, return Mid as default
  console.warn(`Unknown role: ${role}, defaulting to Mid`);
  return 'Mid';
};

/**
 * Convert team data from CSV format to application model
 * @param teamData Team data in CSV format
 * @returns Team object in application model format
 */
export const teamToTeamObject = (teamData: any): any => {
  if (!teamData) return null;
  
  return {
    id: teamData.id || teamData.team_id || '',
    name: teamData.name || teamData.team_name || '',
    logo: teamData.logo || '',
    region: teamData.region || '',
    winRate: Number(teamData.win_rate || 0),
    blueWinRate: Number(teamData.blue_win_rate || 0),
    redWinRate: Number(teamData.red_win_rate || 0),
    averageGameTime: Number(teamData.average_game_time || 0)
  };
};

/**
 * Convert player data from CSV format to application model
 * @param playerData Player data in CSV format
 * @returns Player object in application model format
 */
export const playerToPlayerObject = (playerData: any): any => {
  if (!playerData) return null;
  
  // Normalize the role
  const playerRole = normalizeRoleName(playerData.role || 'Mid');
  
  return {
    id: playerData.id || playerData.player_id || '',
    name: playerData.name || playerData.player_name || '',
    role: playerRole,
    image: playerData.image || '',
    team: playerData.team || playerData.team_id || '',
    teamName: playerData.team_name || '',
    kda: Number(playerData.kda || 0),
    csPerMin: Number(playerData.cs_per_min || 0),
    damageShare: Number(playerData.damage_share || 0),
    championPool: Array.isArray(playerData.champion_pool) ? playerData.champion_pool : []
  };
};
