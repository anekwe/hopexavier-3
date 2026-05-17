import { createClient } from '@supabase/supabase-js';

let supabaseUrl = (process.env.VITE_SUPABASE_URL || '').trim();
const supabaseKey = (process.env.VITE_SUPABASE_ANON_KEY || '').trim();
if (supabaseUrl.endsWith('/rest/v1/')) supabaseUrl = supabaseUrl.replace('/rest/v1/', '');
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('applications').select('*');
  console.log("Data length:", data?.length, "Error:", error);
}

run();
