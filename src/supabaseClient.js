import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fpvrbbirepbhabuzfswh.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwdnJiYmlyZXBiaGFidXpmc3doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1Mjk2NTYsImV4cCI6MjA5ODEwNTY1Nn0.16gcLCSpjo7GRtvmd0cS8CSsvq_6vtcGEPupHl4UZcA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
