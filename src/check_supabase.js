import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://wptbq3hoxqmayrm56xsf3x.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || ''; // Needs to be loaded
console.log(supabaseUrl)
