import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hjrdlfbpmkwoolobyzjd.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqcmRsZmJwbWt3b29sb2J5empkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3OTk1NDMsImV4cCI6MjA4NTM3NTU0M30.t6Bcqy8Mg-XaA1g4F7bnkJqviE09-UQu3e8pgsNvQUs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
