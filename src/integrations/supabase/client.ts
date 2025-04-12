
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Use the environment variables directly, with fallbacks to empty strings to prevent undefined errors
// The exclamation mark asserts these variables are defined (TypeScript non-null assertion)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://dtddoxxazhmfudrvpszu.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0ZGRveHhhemhtZnVkcnZwc3p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwMjMwNjUsImV4cCI6MjA1ODU5OTA2NX0.50-_KqnPLuy33vrh7qZbRHy8lHzC6nOPGJstjUi56dA';

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
    },
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        'x-application-name': 'lol-analytics',
      },
    },
    realtime: {
      timeout: 60000,
    },
  }
);
