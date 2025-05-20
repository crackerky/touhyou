import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

// Use environment variables instead of hardcoded values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jdqnbufraoieafatvzta.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkcW5idWZyYW9pZWFmYXR2enRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTg4ODU4NTAsImV4cCI6MjAzNDQ2MTg1MH0.bsBhRPR7R8PZ78Vl3FrbCVMwgJYyhpySOoMX1jeDl8Y';

console.log('Initializing Supabase with URL:', supabaseUrl);

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase configuration. Please check .env file');
}

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