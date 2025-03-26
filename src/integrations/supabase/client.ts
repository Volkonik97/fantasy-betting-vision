
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://dtddoxxazhmfudrvpszu.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0ZGRveHhhemhtZnVkcnZwc3p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwMjMwNjUsImV4cCI6MjA1ODU5OTA2NX0.50-_KqnPLuy33vrh7qZbRHy8lHzC6nOPGJstjUi56dA";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(
  SUPABASE_URL, 
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true
    },
    db: {
      schema: 'public'
    },
    global: {
      headers: {
        'x-application-name': 'lol-analytics'
      },
    },
    realtime: {
      timeout: 60000 // Increased timeout for larger operations
    }
    // Removed invalid 'fetch' option that was causing TypeScript errors
  }
);
