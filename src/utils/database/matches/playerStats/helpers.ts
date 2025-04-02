
/**
 * Calcule la moyenne d'un tableau de valeurs
 * @param values Tableau de valeurs
 * @param defaultValue Valeur par défaut si le tableau est vide
 * @returns Moyenne des valeurs
 */
export function calculateAverage(values: any[], defaultValue = 0) {
  if (!values || values.length === 0) return defaultValue;
  
  // Filtrer les valeurs non numériques et nulles
  const numericValues = values.filter(v => 
    v !== null && 
    v !== undefined && 
    !isNaN(Number(v)) &&
    v !== "" && 
    typeof v !== 'boolean'
  );
  
  if (numericValues.length === 0) return defaultValue;
  
  try {
    // Calculer la moyenne avec une conversion explicite en nombre
    const sum = numericValues.reduce((acc, val) => {
      const num = Number(val);
      return acc + (isNaN(num) ? 0 : num);
    }, 0);
    
    return sum / numericValues.length;
  } catch (error) {
    console.error("Error calculating average:", error);
    console.error("Values:", values);
    return defaultValue;
  }
}

/**
 * Normalise une valeur pour s'assurer qu'elle est un nombre
 * @param value Valeur à normaliser
 * @param defaultValue Valeur par défaut si non-numérique
 * @returns Valeur numérique normalisée
 */
export function ensureNumeric(value: any, defaultValue = 0) {
  if (value === null || value === undefined || value === "") {
    return defaultValue;
  }
  
  const numValue = Number(value);
  return isNaN(numValue) ? defaultValue : numValue;
}

/**
 * Vérifie si un objet a tous les champs requis
 * @param obj Objet à vérifier
 * @param requiredFields Champs requis
 * @returns True si tous les champs sont présents et non vides
 */
export function hasRequiredFields(obj: any, requiredFields: string[]): boolean {
  if (!obj) return false;
  
  return requiredFields.every(field => {
    const value = obj[field];
    return value !== undefined && value !== null && value !== "";
  });
}
