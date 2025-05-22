import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

// Debug environment variables
console.log('Environment check:', {
  hasUrl: !!import.meta.env.VITE_SUPABASE_URL,
  hasKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
  isDev: import.meta.env.DEV,
  mode: import.meta.env.MODE
});

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  const error = new Error(
    'Supabase configuration missing. Required environment variables:\n' +
    '- VITE_SUPABASE_URL\n' +
    '- VITE_SUPABASE_ANON_KEY\n' +
    'Please check your .env file and ensure it is being loaded correctly.'
  );
  console.error('Supabase initialization failed:', error);
  throw error;
}

console.log('Initializing Supabase client...');

// Create a single supabase client for interacting with your database
let supabase;
try {
  supabase = createClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true
      }
    }
  );
  console.log('Supabase client initialized successfully');
} catch (error) {
  console.error('Failed to create Supabase client:', error);
  throw error;
}

// Test connection
(async () => {
  try {
    console.log('Testing Supabase connection...');
    const { data, error } = await supabase.from('wallets').select('count').single();
    if (error) {
      console.error('Supabase connection test failed:', {
        error,
        code: error.code,
        message: error.message,
        details: error.details
      });
    } else {
      console.log('Supabase connection test successful:', { data });
    }
  } catch (err) {
    console.error('Supabase connection test threw an error:', {
      name: err.name,
      message: err.message,
      stack: err.stack
    });
  }
})();

export { supabase };