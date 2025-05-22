import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = 'https://tglusypjjcoxkhepmxtx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnbHVzeXBqamNveGtoZXBteHR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MTk0MDEsImV4cCI6MjA2MzI5NTQwMX0.XYSiCjWVfjVeOOUeLC1WQ8mLjF1cMQjUeGUrrmg6r98';

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