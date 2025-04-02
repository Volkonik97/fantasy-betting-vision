
/**
 * Calcule la moyenne d'un tableau de valeurs
 * @param values Tableau de valeurs
 * @param defaultValue Valeur par défaut si le tableau est vide
 * @returns Moyenne des valeurs
 */
export function calculateAverage(values: any[], defaultValue = 0) {
  if (!values || values.length === 0) return defaultValue;
  
  // Filtrer les valeurs non numériques et nulles
  const numericValues = values.filter(v => v !== null && v !== undefined && !isNaN(Number(v)));
  
  if (numericValues.length === 0) return defaultValue;
  
  // Calculer la moyenne
  const sum = numericValues.reduce((acc, val) => acc + Number(val), 0);
  return sum / numericValues.length;
}
