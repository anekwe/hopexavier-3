import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

let supabaseUrl = (process.env.VITE_SUPABASE_URL || '').trim();
const supabaseKey = (process.env.VITE_SUPABASE_ANON_KEY || '').trim();

if (supabaseUrl.endsWith('/rest/v1/')) supabaseUrl = supabaseUrl.replace('/rest/v1/', '');
else if (supabaseUrl.endsWith('/rest/v1')) supabaseUrl = supabaseUrl.replace('/rest/v1', '');
if (supabaseUrl.endsWith('/')) supabaseUrl = supabaseUrl.slice(0, -1);

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('applications').insert({ DOES_NOT_EXIST: 1 });
  console.log("Error:", error);
}

run();
