
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
