import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

// Use environment variables instead of hardcoded values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase configuration. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  );
}

console.log('Initializing Supabase with URL:', supabaseUrl);

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey
);

// Test connection
(async () => {
  try {
    const { data, error } = await supabase.from('wallets').select('count');
    if (error) {
      console.error('Supabase connection test failed:', error);
    } else {
      console.log('Supabase connection successful. Tables available.');
    }
  } catch (err) {
    console.error('Supabase connection test error:', err);
  }
})();