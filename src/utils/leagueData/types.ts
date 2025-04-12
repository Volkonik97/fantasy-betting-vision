
/**
 * Convertit une valeur booléenne, une chaîne ou un nombre en chaîne pour la BD
 */
export function booleanToString(value: any): string | null {
  if (value === undefined || value === null) return null;
  
  if (typeof value === 'boolean') return value ? 'true' : null;
  if (typeof value === 'string') {
    const lowerValue = value.toLowerCase().trim();
    if (['true', '1', 'yes', 'oui', 't', 'y'].includes(lowerValue)) return 'true';
    if (['false', '0', 'no', 'non', 'f', 'n'].includes(lowerValue)) return null;
    // Si c'est un ID d'équipe ou autre valeur, le retourner tel quel
    return value === '' ? null : value;
  }
  if (typeof value === 'number') return value === 1 ? 'true' : null;
  
  return String(value) || null;
}

/**
 * Prépare les données JSON pour la base de données
 */
export function prepareJsonData(data: any): any {
  if (!data) return null;
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch (e) {
      return data;
    }
  }
  return data;
}
