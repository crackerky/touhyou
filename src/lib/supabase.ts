import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

// Try-catch block to handle initialization errors
let supabase;

try {
  // Use environment variables instead of hardcoded values
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jdqnbufraoieafatvzta.supabase.co';
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkcW5idWZyYW9pZWFmYXR2enRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTg4ODU4NTAsImV4cCI6MjAzNDQ2MTg1MH0.bsBhRPR7R8PZ78Vl3FrbCVMwgJYyhpySOoMX1jeDl8Y';

  // Validate URL and key to avoid invalid client creation
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase URL or Anon Key is missing');
    // Create a mock client with methods that safely fail
    supabase = createMockClient();
  } else {
    // Create a single supabase client for interacting with your database
    supabase = createClient<Database>(
      supabaseUrl,
      supabaseAnonKey
    );
  }
} catch (error) {
  console.error('Failed to initialize Supabase client:', error);
  // Create a mock client that won't crash the app
  supabase = createMockClient();
}

// Create a mock client that returns safe defaults for all methods
function createMockClient() {
  return {
    from: () => ({
      select: () => ({ data: [], error: new Error('Supabase client not initialized') }),
      insert: () => ({ data: null, error: new Error('Supabase client not initialized') }),
      update: () => ({ data: null, error: new Error('Supabase client not initialized') }),
      eq: () => ({ data: null, error: new Error('Supabase client not initialized') }),
      single: () => ({ data: null, error: new Error('Supabase client not initialized') }),
    }),
    auth: {
      onAuthStateChange: () => ({ data: null, error: null }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    },
  };
}

export { supabase };