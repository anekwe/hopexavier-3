import { createClient } from '@supabase/supabase-js';

let supabaseUrl = (process.env.VITE_SUPABASE_URL || '').trim();
const supabaseServiceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
if (!supabaseServiceKey) console.log("No service key");

if (supabaseUrl.endsWith('/rest/v1/')) supabaseUrl = supabaseUrl.replace('/rest/v1/', '');
const supabase = createClient(supabaseUrl, supabaseServiceKey || 'dummy');

async function run() {
  if (!supabaseServiceKey) return;
  const { data, error } = await supabase.from('applications').select('*');
  console.log("Data:", data, "Error:", error);
}

run();
