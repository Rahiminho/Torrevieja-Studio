import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? 'https://qzqaqvcmkampzspqeryo.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6cWFxdmNta2FtcHpzcHFlcnlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyNjEwMTYsImV4cCI6MjA4OTgzNzAxNn0.pafbnD39pvLnqwvfB7pj3dnQHDhE-ZK98xyKq9GafT0';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
