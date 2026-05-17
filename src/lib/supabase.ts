import { createClient } from '@supabase/supabase-js';

let supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

// Fix common mistake where users include /rest/v1 in their URL
if (supabaseUrl.endsWith('/rest/v1/')) {
  supabaseUrl = supabaseUrl.replace('/rest/v1/', '');
} else if (supabaseUrl.endsWith('/rest/v1')) {
  supabaseUrl = supabaseUrl.replace('/rest/v1', '');
}
if (supabaseUrl.endsWith('/')) {
  supabaseUrl = supabaseUrl.slice(0, -1);
}

// If the user hasn't configured the environment variables, use placeholder
if (!supabaseUrl || supabaseUrl === 'YOUR_SUPABASE_URL') {
  supabaseUrl = 'https://placeholder.supabase.co';
} else if (!supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
  supabaseUrl = 'https://' + supabaseUrl;
}

try {
  new URL(supabaseUrl);
} catch (e) {
  console.error("Invalid Supabase URL format:", supabaseUrl);
  supabaseUrl = 'https://placeholder.supabase.co';
}

// Basic mock/fallback if keys are not provided
export const isSupabaseConfigured = supabaseUrl !== 'https://placeholder.supabase.co';

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey || 'placeholder-key'
);
