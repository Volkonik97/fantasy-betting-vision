import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

// Chargement des variables d'environnement
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Vérification explicite pour éviter les erreurs difficiles à déboguer
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '🚨 Variables d’environnement SUPABASE_URL et SUPABASE_ANON_KEY non définies. Vérifie tes secrets GitHub ou ton fichier .env.',
  );
}

// Création du client Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
